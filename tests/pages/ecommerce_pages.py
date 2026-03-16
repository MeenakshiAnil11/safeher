"""Page Objects for E-commerce happy path tests."""

import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from .base_page import BasePage


class ShopHomePage(BasePage):
    URL = "http://localhost:3000/shop"

    SHOP_HOME = (By.CSS_SELECTOR, ".shop-home, .shop-header")
    SEARCH_INPUT = (By.CSS_SELECTOR, ".search-bar .search-input")
    SEARCH_BUTTON = (By.CSS_SELECTOR, ".search-bar .search-button")
    PRODUCT_LINKS = (By.CSS_SELECTOR, ".product-card-link")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()

    def is_loaded(self):
        return self.is_element_present(*self.SHOP_HOME, timeout=15)

    def search(self, keyword):
        self.type_text(*self.SEARCH_INPUT, keyword)
        self.click(*self.SEARCH_BUTTON)
        time.sleep(1)

    def open_first_product(self):
        links = self.find_all(*self.PRODUCT_LINKS, timeout=15)
        assert len(links) > 0, "No products found on shop page"
        self.scroll_to(links[0])
        self.js_click(links[0])
        time.sleep(1)


class ProductDetailPage(BasePage):
    ADD_TO_CART = (By.CSS_SELECTOR, ".btn-add-to-cart")
    BUY_NOW = (By.CSS_SELECTOR, ".btn-buy-now")
    TITLE = (By.CSS_SELECTOR, ".product-title")

    def is_loaded(self):
        return self.is_element_present(*self.TITLE, timeout=15)

    def add_to_cart(self):
        self.click(*self.ADD_TO_CART, timeout=15)
        time.sleep(1)
        try:
            alert = self.driver.switch_to.alert
            alert.accept()
        except Exception:
            pass

    def buy_now(self):
        self.click(*self.BUY_NOW, timeout=15)
        time.sleep(1)


class CartPage(BasePage):
    URL = "http://localhost:3000/shop/cart"

    CART_PAGE = (By.CSS_SELECTOR, ".cart-page")
    CART_EMPTY = (By.CSS_SELECTOR, ".cart-empty")
    CART_ITEM = (By.CSS_SELECTOR, ".cart-item")
    CHECKOUT_BTN = (By.CSS_SELECTOR, ".btn-checkout")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()

    def is_loaded(self):
        return self.is_element_present(*self.CART_PAGE, timeout=15)

    def has_items(self):
        return len(self.driver.find_elements(*self.CART_ITEM)) > 0

    def proceed_checkout(self):
        self.click(*self.CHECKOUT_BTN, timeout=15)
        time.sleep(1)


class CheckoutPage(BasePage):
    URL = "http://localhost:3000/shop/checkout"

    CHECKOUT_PAGE = (By.CSS_SELECTOR, ".checkout-page")
    NAME = (By.ID, "name")
    PHONE = (By.ID, "phone")
    ADDRESS1 = (By.ID, "addressLine1")
    ADDRESS2 = (By.ID, "addressLine2")
    CITY = (By.ID, "city")
    STATE = (By.ID, "state")
    PIN = (By.ID, "postalCode")
    COUNTRY = (By.ID, "country")
    CONTINUE_PAYMENT = (By.CSS_SELECTOR, ".btn-continue")
    COD_RADIO = (By.CSS_SELECTOR, "input[name='paymentMethod'][value='cod']")
    PLACE_ORDER = (By.CSS_SELECTOR, ".btn-place-order")

    def is_loaded(self):
        return self.is_element_present(*self.CHECKOUT_PAGE, timeout=15)

    def fill_shipping_details(self):
        self.type_text(*self.NAME, "Test User")
        self.type_text(*self.PHONE, "9876543210")
        self.type_text(*self.ADDRESS1, "123 Main Street")
        self.type_text(*self.ADDRESS2, "Near City Center")
        self.type_text(*self.CITY, "Kochi")
        Select(self.find(*self.STATE)).select_by_visible_text("Kerala")
        self.type_text(*self.PIN, "686001")
        Select(self.find(*self.COUNTRY)).select_by_visible_text("India")

    def continue_to_payment(self):
        self.click(*self.CONTINUE_PAYMENT, timeout=15)
        time.sleep(1)

    def choose_cod(self):
        radio = self.find(*self.COD_RADIO)
        if not radio.is_selected():
            self.js_click(radio)
        time.sleep(0.5)

    def place_order(self):
        btn = self.find(*self.PLACE_ORDER, timeout=20)
        self.scroll_to(btn)
        self.js_click(btn)
        time.sleep(2)
        # If an alert appears (validation/server message), accept and allow retry
        try:
            alert = self.driver.switch_to.alert
            alert.accept()
            time.sleep(1)
        except Exception:
            pass


class OrderConfirmationPage(BasePage):
    CONFIRMATION_PAGE = (By.CSS_SELECTOR, ".order-confirmation-page")
    ORDER_NUMBER = (By.CSS_SELECTOR, ".order-number")
    TRACK_ORDER_LINK = (By.CSS_SELECTOR, "a.btn-track-order")

    def is_loaded(self):
        return self.is_element_present(*self.CONFIRMATION_PAGE, timeout=20)

    def get_order_number(self):
        text = self.get_text(*self.ORDER_NUMBER, timeout=15)
        # format: "Order Number: XXX"
        return text.split(":", 1)[-1].strip() if ":" in text else text.strip()

    def open_order_history(self):
        self.click(*self.TRACK_ORDER_LINK, timeout=15)
        time.sleep(1)


class OrderHistoryPage(BasePage):
    ORDER_HISTORY_PAGE = (By.CSS_SELECTOR, ".order-history-page")
    SEARCH_INPUT = (By.CSS_SELECTOR, ".search-bar input")
    ORDER_NUMBER = (By.CSS_SELECTOR, ".order-number")

    def is_loaded(self):
        return self.is_element_present(*self.ORDER_HISTORY_PAGE, timeout=20)

    def search_order(self, order_number):
        self.type_text(*self.SEARCH_INPUT, order_number)
        time.sleep(1)

    def order_exists(self, order_number):
        elems = self.driver.find_elements(*self.ORDER_NUMBER)
        return any(order_number in e.text for e in elems)


class UserLogoutPage(BasePage):
    USER_AVATAR = (By.XPATH, "//header//div[contains(@style,'linear-gradient') and contains(@style,'cursor') and normalize-space(text())!='']")
    LOGOUT_ITEM = (By.XPATH, "//div[normalize-space()='Logout']")

    def logout_via_header_menu(self):
        avatar_candidates = self.driver.find_elements(*self.USER_AVATAR)
        assert len(avatar_candidates) > 0, "User avatar/dropdown trigger not found"
        self.js_click(avatar_candidates[-1])
        self.click(*self.LOGOUT_ITEM, timeout=10)
        time.sleep(1)
