const SUBSCRIPTION_KEY = "isSubscribed";
const SUBSCRIPTION_EVENT = "safeher-subscription-updated";

export const isSubscribedLocal = () => localStorage.getItem(SUBSCRIPTION_KEY) === "true";

export const setSubscribedLocal = (value) => {
  const normalized = value ? "true" : "false";
  localStorage.setItem(SUBSCRIPTION_KEY, normalized);
  window.dispatchEvent(
    new CustomEvent(SUBSCRIPTION_EVENT, {
      detail: { isSubscribed: normalized === "true" },
    })
  );
};

export const subscribeToSubscriptionUpdates = (callback) => {
  if (typeof callback !== "function") return () => {};
  const handleCustomEvent = (event) => callback(Boolean(event?.detail?.isSubscribed));
  const handleStorageEvent = (event) => {
    if (event.key !== SUBSCRIPTION_KEY) return;
    callback(event.newValue === "true");
  };
  window.addEventListener(SUBSCRIPTION_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);
  return () => {
    window.removeEventListener(SUBSCRIPTION_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
};
