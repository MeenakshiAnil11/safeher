import React from "react";
import { useParams } from "react-router-dom";
import ConceiveArticleDetail from "./ConceiveArticleDetail";
import PregnancyArticleReader from "./PregnancyArticleReader";

export default function ArticleDetailRouter() {
  const { articleId } = useParams();
  const isPregnancyArticle = String(articleId || "").startsWith("preg-");

  if (isPregnancyArticle) {
    return <PregnancyArticleReader />;
  }

  return <ConceiveArticleDetail />;
}
