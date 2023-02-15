import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import Pagination from "./Pagination";
import { useRef } from "react";
import parse from "html-react-parser";
import GoogleSheet from "./GoogleSheet";
import View from "./View";
import axios from "axios";
import { NavLink } from "react-router-dom";
const { base64encode, base64decode } = require("nodejs-base64");

const Profile = () => {
  let EmailDataArray = [];
  let obj = {
    "Order Date": "",
    "Order Number": "",
    Address: "",
    "Delivery Date": "",
    "Order Total": "",
    "Fedex tracking number": "",
  };
  const [data, setData] = useState();
  const [storemsg, setStoremsg] = useState();
  const [msg, setMsg] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setpostPerPage] = useState(5);
  const [pages, setPages] = useState();

  const [info, setInfo] = useState({
    "Order Date": "",
    "Order Number": "",
    Address: "",
    "Delivery Date": "",
    "Order Total": "",
    "Fedex tracking number": "",
  });
  //   {"Order Date": "",
  // "Order Number": ""}
  // );
  // const[demo,setDemo]=useState();
  const [activeMessage, setActiveMessage] = useState(null);

  const btnref = useRef(null);

  const GetData = async () => {
    let params = {};
    var regex = /([^&=]+)=([^&]*)/g,
      m;
    while ((m = regex.exec(window.location.href))) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    if (Object.keys(params).length > 0) {
      localStorage.setItem("authInfo", JSON.stringify(params));
    }
    window.history.pushState({}, document.title, "/" + "profile");
    let info = JSON.parse(localStorage.getItem("authInfo"));
    setData(info["access_token"]);
  };

  function logout() {
    let params = {};
    var regex = /([^&=]+)=([^&]*)/g,
      m;
    while ((m = regex.exec(window.location.href))) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    if (Object.keys(params).length > 0) {
      localStorage.setItem("authInfo", JSON.stringify(params));
    }
    let info = JSON.parse(localStorage.getItem("authInfo"));
    fetch("https://oauth2.googleapis.com/revoke?token=" + data, {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    }).then((data1) => {
      window.location.href = "http://localhost:3000/";
    });
  }

  useEffect(() => {
    GetData();
  }, []);

  async function getMessages(number, q = "") {
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${number}&q='is:unread'&q=${q}`;
    // if (q) {
    //   // url = url + `&q=${q}`;
    // }

    let msgList = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data}`,
      },
    });
    msgList = await msgList.json();
    // console.log(msgList);
    msgList = await Promise.all(
      (msgList.messages || []).map(async (message) => {
        let msgDetail = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data}`,
            },
          }
        );
        msgDetail = await msgDetail.json();
        let messageData = {
          id: msgDetail.id,
          msg: msgDetail.snippet,
        };
        // console.log(msgDetail);
        return {
          id: msgDetail.id,
          msg: msgDetail.snippet,
          body: (() => {
            if (Array.isArray(msgDetail.payload.parts))
              return msgDetail.payload.parts[1].body.data;
            if (msgDetail.payload.mimeType === "text/html") {
              return msgDetail.payload.body.data;
            }
          })(),
          ...msgDetail.payload.headers.reduce((acc, curr) => {
            if (["Date", "From", "To", "Subject"].includes(curr.name)) {
              return {
                ...acc,
                [curr.name]: curr.value,
              };
            }

            return acc;
          }, {}),
        };
      })
    );
    const lastPostIndex = currentPage * postPerPage;
    const firstPostIndex = lastPostIndex - postPerPage;
    const newmsgList = msgList.slice(firstPostIndex, lastPostIndex);
    console.log(msgList);
    setMsg(msgList);
    // setMsg(msgList)
    (msgList || []).map((ele) => {
      let obj = {
        "Order Date": "",
        "Order Number": "",
        Address: "",
        "Delivery Date": "",
        "Order Total": "",
        "Fedex tracking number": "",
      };
      let htmlString = base64decode(ele.body);
      const parser = new DOMParser();
      const doc3 = parser.parseFromString(htmlString, "text/html");
      console.log(doc3);
      let nodeList = doc3.querySelectorAll("div");
      // console.log(nodeList)
      nodeList.forEach((tr) => {
        let check = tr.innerText;
        // console.log(check)
        if (check.includes("Address")) {
          console.log(check);
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
            "Order Total": check.replace(/[a-z,]/gi, "").trim(),
          };
          if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
            setInfo(obj);
          }
        }
        if (check.includes("Fedex tracking number")) {
          obj = {
            ...obj,
            "Fedex tracking number": check.replace(/\D/g, ""),
          };
          if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
            setInfo(obj);
          }
        }
        if (check.includes("Delivery date")) {
          obj = {
            ...obj,
            "Delivery Date": check.replace("Delivery date", "").trimStart(),
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
          console.log(obj);
          if (obj["Order Date"] !== "" && obj["Order Number"] !== "") {
            setInfo(obj);
          }
        }
      });
      EmailDataArray.push(obj);
    });
    console.log(EmailDataArray)
    const UniqueEmailData=EmailDataArray.reduce((updatedOrderList, currentOrder) => {
      const existingOrder = updatedOrderList.find(
        (eachOrder) => eachOrder["Order Number"] === currentOrder["Order Number"]
      );
      // order not present in our accumulator
      if (!existingOrder) {
        // add into accumulator with order id as key
        return [...updatedOrderList, currentOrder];
      }
    
      // order already present in accumulator
      // modify the order details
    const updatedOrder = {
      "Order Number": existingOrder["Order Number"],
      "Order Date": existingOrder["Order Date"] === "" ? currentOrder["Order Date"] : existingOrder["Order Date"],
      "Delivery Date":existingOrder["Delivery Date"] === ""? currentOrder["Delivery Date"] : existingOrder["Delivery Date"],
      "Fedex tracking number":existingOrder["Fedex tracking number"] === ""? currentOrder["Fedex tracking number"] : existingOrder["Fedex tracking number"],
      "Order Total":existingOrder["Order Total"] === ""? currentOrder["Order Total"] : existingOrder["Order Total"],  
      Address:existingOrder["Address"] === ""? currentOrder["Address"] : existingOrder["Address"],  
    
    };
    
      return updatedOrderList.map((eachOrder) =>
        eachOrder["Order Number"] === currentOrder["Order Number"] ? updatedOrder : eachOrder
      );
    }, []);

    // const extractedData = EmailDataArray.filter((item) => {
    //   return item["Order Number"] !== "";
    // });
  //  let UniqueextractedDataArray=[]
  //  for(let i=0;i<extractedData.length;i++)
  //  {
   
  //   for(let j=i+1;j<extractedData.length;j++)
  //   {
  //     if(extractedData[i]["Order Number"]===extractedData[j]["Order Number"])
  //     {
  //       if (extractedData[i]["Order Date"] === "" && extractedData[j]["Order Date"] !== "") {
  //         extractedData[i]["Order Date"]=extractedData[j]["Order Date"]
  //       }
        
  //       if (extractedData[i].Address === "" && extractedData[j].Address !== "") {
  //             extractedData[i].Address=     extractedData[j].Address
  //       }
       
  //       if (extractedData[i]["Delivery Date"] === "" && extractedData[j]["Delivery Date"] !== "") {
  //         extractedData[i]["Delivery Date"]=extractedData[j]["Delivery Date"]
  //       }
        
  //       if (extractedData[i]["Order Total"] === "" && extractedData[j]["Order Total"] !== "") {
  //         extractedData[i]["Order Total"]=extractedData[j]["Order Total"]
  //       }
        
  //       if (
  //         extractedData[i]["Fedex tracking number"] === "" &&
  //         extractedData[j]["Fedex tracking number"] !== ""
  //       ) {
  //        extractedData[i]["Fedex tracking number"]=extractedData[j]["Fedex tracking number"]
  //       }      
  //       extractedData.splice(j,j)
  //     }
  //   }
  //  }
   console.log(UniqueEmailData)
    // return Promise.allSettled(
      // const sheetData = await GetSheetData();
      // UniqueEmailData.map(async ( email) => {        
      //   await UpdateSheet(email, sheetData.data);
        
      // })
    // );

    // console.log("all done");
  }

  const UpdateSheet = async (list, rows) => {
    // const promises = list.map((list) => {

    const existinglistInSheet = (rows || []).find(
      (row) => row["Order Number"] === list["Order Number"]
    );
    if (existinglistInSheet) {
      let index = 0;
      rows.forEach((row) => {
        if (row["Order Number"] === list["Order Number"]) {
          // console.log("result is true");
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
          if (row["Order Total"] !== "" && list["Order Total"] === "") {
            list["Order Total"] = row["Order Total"];
          }
          if (
            row["Fedex tracking number"] !== "" &&
            list["Fedex tracking number"] === ""
          ) {
            list["Fedex tracking number"] = row["Fedex tracking number"];
          }
          // axios
          //   .put(
          //     `https://sheet.best/api/sheets/ff3d054f-44f7-4651-ae5b-2a3c7776c0a0/${index}`,
          //     list
          //   )
          //   .then((putresponse) => {
          //     console.log(putresponse);
          //   });
        }
        index = index + 1;
      });
    } else {
      // axios
      //   .post(
      //     "https://sheet.best/api/sheets/ff3d054f-44f7-4651-ae5b-2a3c7776c0a0",
      //     list
      //   )
      //   .then(async (postresponse) => {
      //     let postresponseData = await postresponse.data;
      //     console.log(postresponseData);
      //   });
    }
  };
  async function GetSheetData() {
    // let response = await axios
    //   .get("https://sheet.best/api/sheets/ff3d054f-44f7-4651-ae5b-2a3c7776c0a0")
    //   .then((res) => {
    //     return res;
    //   });
    // return response;
  }

  console.log(storemsg);

  // useEffect(() => {
  //   if (data) {
  //     getMessages();
  //   }
  // }, [data]);

  // console.log(msg);
  return (
    <StyleMail>
      
      <div className="navbar">
      <h1>Welcome to Gmail Inbox</h1>
      <div className="rightsectionnavbar">
      <NavLink to="/googlesheet"><button className="SheetBtn">Click Here For GoogleSheet</button></NavLink>
         <button onClick={logout} className="logout">
        LogOut
      </button>
       </div>
      
      
      
      </div>
      <div className="searchBar">
        <label for="search">
          <b>Enter Keyword</b>
        </label>
        <input
          type="text"
          id="search"
          placeholder="Search Messages"
          ref={btnref}
          className="search"
        />
        <button
          id="searchBtn"
          onClick={() => getMessages(5, btnref.current.value)}
        >
          Search Messages
        </button>
      </div>
      <div className="container">
        <div className="leftSection">
          <table>
            <thead>
              <br />
              <tr>
                <th>
                  <h3>Subject</h3>
                </th>
              </tr>
              <hr />
            </thead>

            <tbody id="result">
              {(msg || []).map((ele) => {
                // console.log(info);

                return (
                  <>
                    <tr key={ele.id}>
                      <td>
                        <li>{ele.Subject}</li>
                      </td>
                    </tr>

                    <div className="btn">
                      <span
                        onClick={() => {
                          let element = base64decode(ele.body);
                          let show = parse(element);
                          return setActiveMessage(() => {
                            return show;
                          });
                        }}
                      >
                        <View view={activeMessage} />
                      </span>

                      {/* <span>
                        <button
                          className="btnUpdate"
                          onClick={() => {
                            // let element = base64decode(ele.body);
                            // const parser = new DOMParser();
                            // const htmlString = element;
                            // const doc3 = parser.parseFromString(
                            //   htmlString,
                            //   "text/html"
                            // );
                            // console.log(doc3);
                            // let nodeList = doc3.querySelectorAll("div");
                            // nodeList.forEach((tr) => {
                            //   let check = tr.innerText;
                            //   if (check.includes("Address")) {
                            //     obj = {
                            //       ...obj,
                            //       Address: check.replace("Address", "").trimStart(),
                            //     };
                            //     if (
                            //       obj["Order Date"] !== "" &&
                            //       obj["Order Number"] !== ""
                            //     ) {
                            //       setInfo(obj);
                            //     }
                            //   }
                            //   if (check.includes("Order total")) {
                            //     obj = {
                            //       ...obj,
                            //       "Order Total": check.replace(/[a-z,]/gi, "").trim(),
                            //     };
                            //     if (
                            //       obj["Order Date"] !== "" &&
                            //       obj["Order Number"] !== ""
                            //     ) {
                            //       setInfo(obj);
                            //     }
                            //   }
                            //   if (check.includes("Fedex tracking number")) {
                            //     obj = {
                            //       ...obj,
                            //       "Fedex tracking number": check.replace(
                            //         /\D/g,
                            //         ""
                            //       ),
                            //     };
                            //     if (
                            //       obj["Order Date"] !== "" &&
                            //       obj["Order Number"] !== ""
                            //     ) {
                            //       setInfo(obj);
                            //     }
                            //   }
                            //   if (check.includes("Delivery date")) {
                            //     obj = {
                            //       ...obj,
                            //       "Delivery Date": check.replace(
                            //         "Delivery date",
                            //         ""
                            //       ).trimStart(),
                            //     };
                            //     if (
                            //       obj["Order Date"] !== "" &&
                            //       obj["Order Number"] !== ""
                            //     ) {
                            //       setInfo(obj);
                            //     }
                            //   }
                            //   if (
                            //     check.includes("Order date") &&
                            //     !check.includes("Order number")
                            //   ) {
                            //     obj = {
                            //       ...obj,
                            //       "Order Date": check.replace(
                            //         "Order date:",
                            //         ""
                            //       ).trimStart(),
                            //     };
                            //     if (
                            //       obj["Order Date"] !== "" &&
                            //       obj["Order Number"] !== ""
                            //     ) {
                            //       setInfo(obj);
                            //     }
                            //   }
                            //   if (
                            //     !check.includes("Order date") &&
                            //     check.includes("Order number")
                            //   ) {
                            //     obj = {
                            //       ...obj,
                            //       "Order Number": check.replace(/\D/g, "").trimStart(),
                            //     };
                            //     if (
                            //       obj["Order Date"] !== "" &&
                            //       obj["Order Number"] !== ""
                            //     ) {
                            //       setInfo(obj);
                            //     }
                            //   }
                            //   if (check.includes("order #")) {
                            //     obj = {
                            //       ...obj,
                            //       "Order Number": check.replace(/\D/g, "").trimStart(),
                            //     };
                            //     console.log(obj);
                            //     if (
                            //       obj["Order Date"] !== "" &&
                            //       obj["Order Number"] !== ""
                            //     ) {
                            //       setInfo(obj);
                            //     }
                            //   }
                            //   return info;
                            // });
                          }}
                        >
                          Update
                        </button>
                      </span> */}
                    </div>
                  </>
                );
              })}

              {/* <Pagination totalPosts={(storemsg || []).length} postPerPage={postPerPage} setCurrentPage={setCurrentPage}/> */}
              {/* {
              (pages || []).forEach((page,index)=>{
                return(
                <button key={index} onClick={()=>{
                    setCurrentPage(page)
                    console.log(setCurrentPage(page),page)
                    
                    }}>{page}</button>)
            })
            } */}
            </tbody>
          </table>
        </div>
        
      </div>

      
    </StyleMail>
  );
};
const StyleMail = styled.div`
.main{
  background-color: pink;
}
 
  .leftSection {
    width: 40vw;
    height: 80vh;
    /* border: 2px solid black; */
    height: 100%;
    
  }
  .navbar {
    /* width: auto;
    height: auto;     */
    display: flex;
    
  }
  .rightsectionnavbar{
     position: fixed;    
    right: 15px;
    top: 15px; 
    margin-left: 50px;

   
  }
  /* @media screen and (max-width:770px){
      .rightsectionnavbar{
        display: flex;
        flex-direction: column;
      }
      
        .logout{
          position: fixed;
          top: 0px;
          right: 40px;

        }
        .SheetBtn{
          position: fixed;
          top: 50px;
          right: 19px;
          height: auto;
          width: 50px;
        }
      
    } */
  .logout {
    color: white;
    background-color: #cc7878;
    border-radius: 5px;
    border: none;
    font-size: 15px;
    width: 90px;
    /* margin-top: 20vw; */
    /* position: fixed; */
    /* bottom: 0px; */
    /* right: 5px;
    top: 2px; */
    /* float: left; */
  }
  .search {
    width: 20vw;
    height: 20px;
    border: 2px solid black;
    border-radius: 5px;
    margin-left: 10px;
  }
  .SheetBtn{
    background-color: #5398a6;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    height: auto;
    width: auto;
    color: white;
    margin-right:25px ;
    /* position: fixed;
    right: 25px;
    top: 5px; */
  }
  .btnUpdate {
    background-color: #0b3629;
    width: 100%;
    border: none;
    border-radius: 5px;
    /* backgroundColor:"#0b3629", */
    color: white;
    margin-top: 16px;
    margin-left: 5px;
  }
  #searchBtn {
    align-lists: center;
    display: flex;
    height: auto;
    width: auto;
    background-color: #5398a6;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    margin-left: 10px;
    color: white;
  }
  .searchBar {
    justify-content: space-evenly;
    width: 40vw;
    display: flex;
    align-lists: center;
  }
  .btn {
    /* margin-top: 2px; */
    /* width: 100px; */
    display: flex;
    justify-content: center;
  }
`;

export default Profile;
