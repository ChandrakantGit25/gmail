import { base64decode } from "nodejs-base64";
import csv from "csvtojson";
import axios from "axios";
import queryString from "query-string";

export const wrappedFetch = async (method, { url, query, token }) => {
  let response = await fetch(queryString.stringifyUrl({ url, query }), {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
export const getMessageList = async (query, token) => {
  const { messages } = await wrappedFetch("GET", {
    url: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    query,
    token,
  });

  return messages;
};
export const getMessageDetails = async (query, token) => {
  const response = await wrappedFetch("GET", {
    url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${query.id}`,
    token,
  });
  let html = response.payload.parts.find(
    (part) => part.mimeType === "text/html"
  );
  html = html ? html.body.data : "";
  return { id: response.id, msg: response.snippet, body: html };
};
export const getMessageListWithDetails = (query, token) => {
  return Promise.all(
    (query.list || []).map((item) => {
      return getMessageDetails({ id: item.id }, token);
    })
  );
};

export const getListOfExtractedData = (msgList) => {
  let EmailDataArray = [];
  const setInfo = () => {};
  (msgList || []).map((ele) => {
    let obj = {
      "Order Date": "",
      "Order Number": "",
      Address: "",
      "Delivery Date": "",
      "Item Amount": "",
      "tracking number": "",
      CC: "",
      STATUS: "NOT RECEIVED",
      "TRUE/FALSE":"FALSE",
      "Taxable":"N",
      "Item Quantity":"",
      "Item Rate":"",
      "Item Description":"",
      "Item":"",
      "Place Of Supply":""
    };
    let htmlString = base64decode(ele.body);
    const parser = new DOMParser();
    const doc3 = parser.parseFromString(htmlString, "text/html");

    let nodeList = doc3.querySelectorAll("div");
    nodeList.forEach((tr) => {
      let check = tr.innerText;
      if (check.includes("Address")) {
        obj = {
          ...obj,
          Address: check.replace("Address", "").trimStart(),
        };
        if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
          setInfo(obj);
        }
      }
      if (check.includes("Order total")) {
        obj = {
          ...obj,
          "Item Amount": check.replace(/\D/g, "").trim(),
        };
        if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
          setInfo(obj);
        }
      }
      if (check.includes("tracking number")) {
        obj = {
          ...obj,
          "tracking number": check.replace(/\D/g, ""),
        };
        if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
          setInfo(obj);
        }
      }
      if ((check.includes("arrive by") && !check.includes("Order date") && !check.includes("order #") && !check.includes("shipment") && !check.includes("On time") && !check.includes("Arrives early"))) {
        obj = {
          ...obj,
          "Delivery Date": check.split(" ").slice(7,11).join(""),
        };
        if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
          setInfo(obj);
        }
      }
      if (check.includes("Order date") && !check.includes("Order number")) {
        obj = {
          ...obj,
          "Order Date": check.replace("Order date:", "").trimStart(),
        };
        if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
          setInfo(obj);
        }
      }

      if (!check.includes("Order date") && check.includes("Order number")) {
        obj = {
          ...obj,
          "Order Number": check.replace(/\D/g, "").trimStart(),
        };
        if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
          setInfo(obj);
        }
      }
      if (check.includes("order #")) {
        obj = {
          ...obj,
          "Order Number": check.replace(/\D/g, "").trimStart(),
        };
        if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
          setInfo(obj);
        }
      }
      if (check.includes("Payment method") && !check.includes("Item Amount")) {        
        obj = {
          ...obj,
          CC: check.replace(/\D/g, "").trimStart(),
        };
      }
      if ((check.includes("arrive by") && !check.includes("Order date") && !check.includes("order #") && !check.includes("shipment"))){    
           
        obj = {
          ...obj,
          "Item Quantity": Number(check.split(" ")[0])
        };
      }
      if(obj["Item Quantity"] !=="" && obj["Item Amount"] !=="")       
      obj = {
        ...obj,
        "Item Rate": (obj["Item Amount"])/obj["Item Quantity"]
      };    
         
    });
    EmailDataArray.push(obj);
    // EmailDataArray=EmailDataArray.filter((email)=>email["tracking number"]!=="")
  });
  console.log("EmailDataArray", EmailDataArray)
  EmailDataArray.map((ele) => {
    EmailDataArray.forEach((elef) => {
      if (ele['Order Number'] === elef['Order Number']) {
        ele['Order Date'] === '' && elef['Order Date'] !== ''
          ? (ele['Order Date'] = elef['Order Date'])
          : ele['Order Date'];
        ele['Delivery Date'] === '' && elef['Delivery Date'] !== ''
          ? (ele['Delivery Date'] = elef['Delivery Date'])
          : ele['Delivery Date'];
        ele['Item Amount'] === '' && elef['Item Amount'] !== ''
          ? (ele['Item Amount'] = elef['Item Amount'])
          : ele['Item Amount'];
        ele['STATUS'] === '' && elef['STATUS'] !== ''
          ? (ele['STATUS'] = elef['STATUS'])
          : ele['STATUS'];
        ele['CC'] === '' && elef['CC'] !== ''
          ? (ele['CC'] = elef['CC'])
          : ele['CC'];
      }
    });
  });
  console.log("EmailDataArray", EmailDataArray)
  let UniqueEmailDataArray = EmailDataArray.reduce(
    (updatedOrderList, currentOrder) => {
      const existingOrder = updatedOrderList.find(
        (eachOrder) =>
          eachOrder['tracking number'] === currentOrder['tracking number']
      );
      // order not present in our accumulator
      if (!existingOrder) {
        // add into accumulator with order id as key
        return [...updatedOrderList, currentOrder];
      }
  
      // order already present in accumulator
      // modify the order details
      const updatedOrder = {
        'tracking number': existingOrder['tracking number'],
        'Order Date':
          existingOrder['Order Date'] === ''
            ? currentOrder['Order Date']
            : existingOrder['Order Date'],
        'Delivery Date':
          existingOrder['Delivery Date'] === ''
            ? currentOrder['Delivery Date']
            : existingOrder['Delivery Date'],
        'Order Number':
          existingOrder['Order Number'] === ''
            ? currentOrder['Order Number']
            : existingOrder['Order Number'],
        'Item Amount':
          existingOrder['Item Amount'] === ''
            ? currentOrder['Item Amount']
            : existingOrder['Item Amount'],
        Address:
          existingOrder['Address'] === ''
            ? currentOrder['Address']
            : existingOrder['Address'],
        CC: existingOrder['CC'] === '' ? currentOrder['CC'] : existingOrder['CC'],
        STATUS:
          existingOrder['STATUS'] === ''
            ? currentOrder['STATUS']
            : existingOrder['STATUS'],
            "TRUE/FALSE":
          existingOrder['TRUE/FALSE'] === ''
            ? currentOrder['TRUE/FALSE']
            : existingOrder['TRUE/FALSE'],
            "Taxable":
          existingOrder['Taxable'] === ''
            ? currentOrder['Taxable']
            : existingOrder['Taxable'],
            "Item Quantity":
          existingOrder['Item Quantity'] === ''
            ? currentOrder['Item Quantity']
            : existingOrder['Item Quantity'],
      };
      return updatedOrderList.map((eachOrder) =>
        eachOrder['tracking number'] === currentOrder['tracking number']
          ? updatedOrder
          : eachOrder
      );
    },
    []
  );
  UniqueEmailDataArray.map((ele) => {
    UniqueEmailDataArray.forEach((elef) => {
      if (ele['Order Number'] === elef['Order Number']) {
        ele['Order Date'] === '' && elef['Order Date'] !== ''
          ? (ele['Order Date'] = elef['Order Date'])
          : ele['Order Date'];
        ele['Delivery Date'] === '' && elef['Delivery Date'] !== ''
          ? (ele['Delivery Date'] = elef['Delivery Date'])
          : ele['Delivery Date'];
        ele['Item Amount'] === '' && elef['Item Amount'] !== ''
          ? (ele['Item Amount'] = elef['Item Amount'])
          : ele['Item Amount'];
        ele['STATUS'] === '' && elef['STATUS'] !== ''
          ? (ele['STATUS'] = elef['STATUS'])
          : ele['STATUS'];
        ele['CC'] === '' && elef['CC'] !== ''
          ? (ele['CC'] = elef['CC'])
          : ele['CC'];
          ele['TRUE/FALSE'] === '' && elef['TRUE/FALSE'] !== ''
          ? (ele['TRUE/FALSE'] = elef['TRUE/FALSE'])
          : ele['TRUE/FALSE'];
          ele['Taxable'] === '' && elef['Taxable'] !== ''
          ? (ele['Taxable'] = elef['Taxable'])
          : ele['Taxable'];
          ele['Item Quantity'] === '' && elef['Item Quantity'] !== ''
          ? (ele['Item Quantity'] = elef['Item Quantity'])
          : ele['Item Quantity'];
      }
    });
  });
  UniqueEmailDataArray.map((ele)=>{
    if(ele["Item Quantity"] !=="" && ele["Item Amount"] !=="")       
    
      ele["Item Rate"]= (ele["Item Amount"])/ele["Item Quantity"]
    
  })
  console.log("UniqueEmailDataArray",UniqueEmailDataArray)
   UniqueEmailDataArray=UniqueEmailDataArray.filter(
    (email) => email["tracking number"] !== ""
  );
  console.log(UniqueEmailDataArray)
  return UniqueEmailDataArray
};

export const updateSheet = async (list, rows) => {
  // const promises = list.map((list) => {

  const existinglistInSheet = (rows || []).find(
    (row) => row["Order Number"] === list["Order Number"] || row["tracking number"] === list["tracking number"]
  );
  if (existinglistInSheet) {
    let index = 0;
    rows.forEach((row) => {
      if (row["Order Number"] === list["Order Number"]) {
        //  setUpdate(update+1)
        if (row["Order Date"] !== "" && list["Order Date"] === "") {
          list["Order Date"] = row["Order Date"];
        }
        if (row.Address !== "" && list.Address === "") {
          list.Address = row.Address;
        }
        if (row["Delivery Date"] !== "" && list["Delivery Date"] === "") {
          list["Delivery Date"] = row["Delivery Date"];
        }
        if (row["Item Amount"] !== "" && list["Item Amount"] === "") {
          list["Item Amount"] = row["Item Amount"];
        }
        if (row["tracking number"] !== "" && list["tracking number"] === "") {
          list["tracking number"] = row["tracking number"];
        }
        if (row["CC"] !== "" && list["CC"] === "") {
          list["CC"] = row["CC"];
        }
        if (row["Item Quantity"] !== "" && list["Item Quantity"] === "") {
          list["Item Quantity"] = row["Item Quantity"];
        }
        if (row["Item Rate"] !== "" && list["Item Rate"] === "") {
          list["Item Rate"] = row["Item Rate"];
        }
        axios
          .put(
            `https://sheet.best/api/sheets/d36990dc-7871-4909-bb95-91aca7192046/${index}`,
            list
          )
          .then((putresponse) => {});
      }
      index = index + 1;
    });
  } else {
    axios
      .post(
        "https://sheet.best/api/sheets/d36990dc-7871-4909-bb95-91aca7192046",
        list
      )
      .then(async (postresponse) => {
        let postresponseData = await postresponse.data;
      });
  }
};
export const getSheetData = async () => {
  let response = await axios
    .get("https://sheet.best/api/sheets/d36990dc-7871-4909-bb95-91aca7192046")
    .then((res) => {
      return res;
    });
  return response;
};


