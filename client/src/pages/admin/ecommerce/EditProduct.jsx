import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ProductForm from "./ProductForm";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/admin/ecommerce/products" replace />;
  }

  const handleBack = () => {
    navigate("/admin/ecommerce/products");
  };

  return (
    <ProductForm
      product={{ _id: id }}
      onClose={handleBack}
      onSuccess={handleBack}
    />
  );
}
