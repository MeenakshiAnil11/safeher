"""Critical happy-path Selenium tests for E-commerce module."""

import pytest
from pages.login_page import LoginPage
from pages.ecommerce_pages import (
    ShopHomePage,
    ProductDetailPage,
    CartPage,
    CheckoutPage,
    OrderConfirmationPage,
    OrderHistoryPage,
    UserLogoutPage,
)
from config import BASE_URL, PATIENT_EMAIL, PATIENT_PASSWORD


@pytest.fixture(scope="module")
def state(browser):
    return {"driver": browser, "order_number": None}


@pytest.mark.ecommerce
@pytest.mark.success_screenshot
class TestEcommerceHappyPath:
    def test_01_user_login(self, state):
        driver = state["driver"]
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        assert "/login" not in driver.current_url, "Valid login should redirect away from login page"
        driver.get(f"{BASE_URL}/dashboard")
        assert "/dashboard" in driver.current_url, "User dashboard should load after login"

    def test_02_product_search_and_browse(self, state):
        driver = state["driver"]
        shop = ShopHomePage(driver)
        shop.navigate()
        assert shop.is_loaded(), "Shop home should load"

        keyword = "care"
        shop.search(keyword)
        assert "/shop/search" in driver.current_url and "q=" in driver.current_url, "Search should navigate to shop search results URL"

        shop.open_first_product()
        product = ProductDetailPage(driver)
        assert product.is_loaded(), "Product detail page should load from listing"

    def test_03_add_to_cart(self, state):
        driver = state["driver"]
        product = ProductDetailPage(driver)
        assert product.is_loaded(), "Product detail must be open before add-to-cart"
        product.add_to_cart()

        cart = CartPage(driver)
        cart.navigate()
        assert cart.is_loaded(), "Cart page should load"
        assert cart.has_items(), "Cart should contain at least one item after add-to-cart"

    def test_04_checkout_workflow(self, state):
        driver = state["driver"]
        cart = CartPage(driver)
        cart.navigate()
        assert cart.has_items(), "Checkout requires at least one cart item"
        cart.proceed_checkout()

        checkout = CheckoutPage(driver)
        assert checkout.is_loaded(), "Checkout page should load"
        checkout.fill_shipping_details()
        checkout.continue_to_payment()
        checkout.choose_cod()
        checkout.place_order()
        # Retry one more click if still on checkout page
        if "/shop/checkout" in driver.current_url:
            checkout.place_order()

        confirmation = OrderConfirmationPage(driver)
        assert confirmation.is_loaded(), "Order confirmation page should load after successful checkout"

    def test_05_order_confirmation_and_history(self, state):
        driver = state["driver"]
        confirmation = OrderConfirmationPage(driver)
        assert confirmation.is_loaded(), "Order confirmation page should be visible"

        order_number = confirmation.get_order_number()
        assert order_number, "Order confirmation must show an order number"
        state["order_number"] = order_number

        confirmation.open_order_history()
        history = OrderHistoryPage(driver)
        assert history.is_loaded(), "Order history page should load"
        history.search_order(order_number)
        assert history.order_exists(order_number), f"Placed order {order_number} should appear in order history"

    def test_06_logout(self, state):
        driver = state["driver"]
        # Use a page with UserHeader for reliable logout UI
        driver.get(f"{BASE_URL}/subscription#plans")
        logout_page = UserLogoutPage(driver)
        logout_page.logout_via_header_menu()
        assert "/login" in driver.current_url, "User should be redirected to login after logout"
