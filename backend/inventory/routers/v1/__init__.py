from inventory.routers.v1.products import router as products_router
from inventory.routers.v1.warehouses import router as warehouses_router
from inventory.routers.v1.stock import router as stock_router
from inventory.routers.v1.suppliers import router as suppliers_router
from inventory.routers.v1.po import router as po_router

__all__ = [
    "products_router",
    "warehouses_router",
    "stock_router",
    "suppliers_router",
    "po_router"
]
