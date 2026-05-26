import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from inventory.database import get_db
from inventory.models.domain import PurchaseOrder, PurchaseOrderItem, Product, Supplier, StockLevel, StockMovement, Warehouse
from inventory.schemas.po import PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse, PurchaseOrderItemResponse
from inventory.utils.dependencies import RoleChecker, AuthenticatedUser

router = APIRouter(prefix="/po", tags=["Purchase Orders & Procurement"])

@router.get("", response_model=list[PurchaseOrderResponse])
async def list_purchase_orders(
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all purchase orders in the system (paginated).
    Includes their detailed items.
    """
    offset = (page - 1) * limit
    result = await db.execute(select(PurchaseOrder).offset(offset).limit(limit))
    pos = result.scalars().all()
    
    response = []
    for po in pos:
        item_res = await db.execute(select(PurchaseOrderItem).where(PurchaseOrderItem.po_id == po.id))
        items = item_res.scalars().all()
        
        po_dict = PurchaseOrderResponse.model_validate(po)
        po_dict.items = [PurchaseOrderItemResponse.model_validate(item) for item in items]
        response.append(po_dict)
        
    return response

@router.get("/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    po_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a single purchase order by its ID.
    """
    result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    po = result.scalar_one_or_none()
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )
        
    item_res = await db.execute(select(PurchaseOrderItem).where(PurchaseOrderItem.po_id == po.id))
    items = item_res.scalars().all()
    
    response = PurchaseOrderResponse.model_validate(po)
    response.items = [PurchaseOrderItemResponse.model_validate(item) for item in items]
    return response

@router.post("", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    payload: PurchaseOrderCreate,
    current_user: AuthenticatedUser = Depends(RoleChecker(["Admin", "Agent"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Drafts and creates a new procurement purchase order (Admin/Agent only).
    Automatically generates unique PO numbers and calculates total values.
    """
    # Verify supplier exists
    sup_check = await db.execute(select(Supplier).where(Supplier.id == payload.supplier_id))
    if not sup_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target supplier not found"
        )

    # Validate all products exist and calculate total PO cost
    total_cost = 0.0
    for item in payload.items:
        prod_check = await db.execute(select(Product).where(Product.id == item.product_id))
        if not prod_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found in catalog"
            )
        total_cost += item.quantity_ordered * item.unit_cost

    # Generate a unique PO number (e.g. PO-XXXXX)
    random_id = random.randint(1000, 99999)
    po_number = f"PO-{random_id}"

    po = PurchaseOrder(
        po_number=po_number,
        supplier_id=payload.supplier_id,
        status="Draft",
        total_cost=total_cost
    )
    db.add(po)
    await db.commit()
    await db.refresh(po)

    # Insert items
    response_items = []
    for item in payload.items:
        po_item = PurchaseOrderItem(
            po_id=po.id,
            product_id=item.product_id,
            quantity_ordered=item.quantity_ordered,
            quantity_received=0,
            unit_cost=item.unit_cost
        )
        db.add(po_item)
        response_items.append(po_item)

    await db.commit()
    
    for item in response_items:
        await db.refresh(item)

    response = PurchaseOrderResponse.model_validate(po)
    response.items = [PurchaseOrderItemResponse.model_validate(item) for item in response_items]
    return response

@router.put("/{po_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order_status(
    po_id: int,
    payload: PurchaseOrderUpdate,
    current_user: AuthenticatedUser = Depends(RoleChecker(["Admin", "Agent"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates a purchase order. If status transitions to 'Received', 
    the system automatically credits stock levels in the primary warehouse 
    and logs stock auditing events.
    """
    result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    po = result.scalar_one_or_none()
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not located"
        )
        
    old_status = po.status
    
    if payload.status:
        po.status = payload.status
    if payload.delivery_date:
        po.delivery_date = payload.delivery_date
        
    db.add(po)
    
    # Handle auto-crediting stock when PO status transitions to "Received"
    if payload.status == "Received" and old_status != "Received":
        # Fetch active warehouse to place the incoming stock (fallback to id=1)
        wh_result = await db.execute(select(Warehouse).where(Warehouse.status == "Active").limit(1))
        warehouse = wh_result.scalar_one_or_none()
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active warehouse facility available to receive stock"
            )

        # Retrieve all items in the PO
        item_res = await db.execute(select(PurchaseOrderItem).where(PurchaseOrderItem.po_id == po.id))
        items = item_res.scalars().all()

        for item in items:
            # Mark all ordered quantities as successfully received
            item.quantity_received = item.quantity_ordered
            db.add(item)

            # Credit local stock level
            stock_res = await db.execute(
                select(StockLevel).where(
                    StockLevel.product_id == item.product_id,
                    StockLevel.warehouse_id == warehouse.id
                )
            )
            stock = stock_res.scalar_one_or_none()
            if not stock:
                stock = StockLevel(
                    product_id=item.product_id,
                    warehouse_id=warehouse.id,
                    quantity=0
                )
            stock.quantity += item.quantity_ordered
            db.add(stock)

            # Record stock movements audit outbox entry
            movement = StockMovement(
                product_id=item.product_id,
                warehouse_id=warehouse.id,
                quantity_changed=item.quantity_ordered,
                type="INCOMING",
                reference=po.po_number,
                details=f"Received procurement stock from {po.po_number}",
                username=current_user.username
            )
            db.add(movement)

    await db.commit()
    await db.refresh(po)

    # Fetch updated items for output validation
    item_res = await db.execute(select(PurchaseOrderItem).where(PurchaseOrderItem.po_id == po.id))
    items = item_res.scalars().all()
    
    response = PurchaseOrderResponse.model_validate(po)
    response.items = [PurchaseOrderItemResponse.model_validate(i) for i in items]
    return response
