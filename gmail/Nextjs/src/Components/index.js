orders.reduce((updatedOrderList, currentOrder) => {
    const existingOrder = updatedOrderList.find(
      (eachOrder) => eachOrder.id === currentOrder.id
    );
    // order not present in our accumulator
    if (!existingOrder) {
      // add into accumulator with order id as key
      return [...updatedOrderList, currentOrder];
    }
  
    // order already present in accumulator
    // modify the order details
  const updatedOrder = {
      id: existingOrder.id,
      date: currentOrder.date === "" ? existingOrder.date : currentOrder.date,
      delivery:
        currentOrder.delivery === ""
          ? existingOrder.delivery
          : currentOrder.delivery
    };
  
    return updatedOrderList.map((eachOrder) =>
      eachOrder.id === currentOrder.id ? updatedOrder : eachOrder
    );
  }, []);