import React from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { NavLink } from 'react-router-dom'
const GoogleSheet = () => {
  let SheetList=["Wilmington","Hudson"]

    async function GetData(sheetName){        
        let response = await axios
      .get(`https://sheet.best/api/sheets/ff3d054f-44f7-4651-ae5b-2a3c7776c0a0/tabs/${sheetName}`)
      .then((res) => {
        return res;
      });
      console.log(response.data)
      
      response.data.forEach((row)=>{
    //     fetch("https://www.buyersforpoints.com/p/it@api@order-management/cmd/addtracking", {
    //   method: "POST",
    //   headers: {
    //     "Content-type": "application/x-www-form-urlencoded",
    //   },
    // }).then((data1) => {
    //   window.location.href = "http://localhost:3000/";
    // });
        axios.post("/p/it@api@order-management/cmd/addtracking",{
            "user": 8977,
            "email": "skl83@cornell.edu",
            "trackings": [
                {
                    "tracking": row["Fedex tracking number"],
                    "order": row["Order Number"],
                    "amount": row["Order Total"],
                    "notes": row["Order Date"]
                }
            ]
      },{
        headers:{
          // 'Access-Control-Allow-Origin':'*',
            Authorization:"Bearer ec84034708cce2bc6b851a413beeb84b"
        }
      })
      }) 
      
    
    }

    

  return (
    <SheetStyled>
      {/* <div className="navbar"> */}
      
      {/* <p> <NavLink to={"/profile"}> <button className='homebtn'>Home</button></NavLink></p> */}
      
      {/* </div> */}
      <h1>GoogleSheet</h1>
      {SheetList.map((sheet)=>{
        return(
          <>
          <div className='sheetname'><h4 >{sheet}</h4> <button className='btn' onClick={()=>{
            // let data=document.getElementsByClassName("sheet")
            console.log(sheet)
            GetData(sheet)}}>Post</button></div>
          <hr />
          </>
        )
      })}
      
    </SheetStyled>
  )
}
const SheetStyled=styled.div`
.sheetname{
    display: flex;
    justify-content: space-between;
    margin:20px;
}
.homebtn{
  position: fixed;
  left: 5px;
  top: 5px;
  border: none;
  background-color: #5398a6;
  border-radius: 5px;
  color: white;
}
.btn{
    border: 2px solid black;
}
.navbar{
  /* display: flex; */
  /* justify-content: space-e; */
}
`
export default GoogleSheet
