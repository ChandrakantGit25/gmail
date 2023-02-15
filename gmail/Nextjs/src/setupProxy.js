// const proxy=require("http-proxy-middleware");

// module.exports=function(app){
//     app.use(
//         proxy("/p/it@api@order-management/cmd/addtracking",{
//             target:"https://www.buyersforpoints.com",
//             secure:false,
//             changeOrigin:true
//         })
//     )
// }

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://www.example.org/secret',
    changeOrigin: true,
  })
);

app.listen(3000);