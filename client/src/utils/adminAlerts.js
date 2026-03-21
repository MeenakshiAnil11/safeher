import Swal from "sweetalert2";

const DEFAULT_CONFIRM_BUTTON_COLOR = "#6a5af9";

export const showSuccessAlert = (text, options = {}) =>
  Swal.fire({
    title: "Success",
    text,
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: DEFAULT_CONFIRM_BUTTON_COLOR,
    timer: 2000,
    showConfirmButton: true,
    showClass: {
      popup: "swal2-show",
    },
    hideClass: {
      popup: "swal2-hide",
    },
    ...options,
  });

export const showErrorAlert = (text, options = {}) =>
  Swal.fire({
    title: "Error",
    text,
    icon: "error",
    confirmButtonText: "OK",
    confirmButtonColor: DEFAULT_CONFIRM_BUTTON_COLOR,
    showClass: {
      popup: "swal2-show",
    },
    hideClass: {
      popup: "swal2-hide",
    },
    ...options,
  });

export const showInfoAlert = (text, options = {}) =>
  Swal.fire({
    title: "Info",
    text,
    icon: "info",
    confirmButtonText: "OK",
    confirmButtonColor: DEFAULT_CONFIRM_BUTTON_COLOR,
    showClass: {
      popup: "swal2-show",
    },
    hideClass: {
      popup: "swal2-hide",
    },
    ...options,
  });

export const showWarningAlert = (text, options = {}) =>
  Swal.fire({
    title: "Warning",
    text,
    icon: "warning",
    confirmButtonText: "OK",
    confirmButtonColor: DEFAULT_CONFIRM_BUTTON_COLOR,
    showClass: {
      popup: "swal2-show",
    },
    hideClass: {
      popup: "swal2-hide",
    },
    ...options,
  });

export const showConfirmAlert = async ({
  title = "Are you sure?",
  text = "",
  icon = "warning",
  confirmButtonText = "OK",
  cancelButtonText = "Cancel",
  confirmButtonColor = DEFAULT_CONFIRM_BUTTON_COLOR,
  cancelButtonColor = "#6b7280",
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
    reverseButtons: true,
    showClass: {
      popup: "swal2-show",
    },
    hideClass: {
      popup: "swal2-hide",
    },
  });

  return result.isConfirmed;
};
