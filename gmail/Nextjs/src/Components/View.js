import React, { useState } from 'react'
import styled from 'styled-components';
import {Modal,ModalHeader,ModalBody} from "reactstrap";
const View = ({view}) => {
    const [modal,setModal]=useState(false)
  return (
    <ModalStyle>
    <div style={{display:"flex",alignItem:"center"}}>
        <Modal size='xl'
        contentClassName="your-custom-class"
        isOpen={modal}
        toggle={()=>setModal(!modal)}
        >
            <ModalHeader
            toggle={()=>setModal(!modal)}
            >

            </ModalHeader>
            <ModalBody >
                {view}
            </ModalBody>
        </Modal>
      <button 
      className='btn mt-3' 
      style={{backgroundColor:"#0b3629",color:"white",height:"25px",width:"100%",display:"flex",alignItems:"center"}} 
      onClick={()=>setModal(true)}
      >View</button>
    </div>
    </ModalStyle>
  )
}
const ModalStyle=styled.div`
your-custom-class{
  width: 90%;
  max-width: 90vw;
}
`

export default View
