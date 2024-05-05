import React from "react";
import { Flex, Card, Skeleton } from "antd"; // Importe os componentes necessários do Ant Design

const SkeletonCards = ({ count = 2, cardsPerRow = 3 }) => {
  const renderCards = () => {
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push(
        <Card key={i} className="card-meeting">
          <Skeleton active />
        </Card>
      );
    }
    return cards;
  };

  const renderRows = () => {
    const rows = [];
    const totalCards = count * cardsPerRow;
    for (let i = 0; i < totalCards; i += cardsPerRow) {
      rows.push(
        <Flex key={i} style={{ width: "100%" }}>
          {renderCards().slice(i, i + cardsPerRow)}
        </Flex>
      );
    }
    return rows;
  };

  return <>{renderRows()}</>;
};

export default SkeletonCards;
