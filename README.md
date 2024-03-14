# awabah-api

### API Docs

https://documenter.getpostman.com/view/5533777/2s9YkoeMmg

# 📄 Awabah API

This is the api services for Awabah platform

## 🔖 **Getting started guide** 🔖

## Authentication

You must include an API key in each request to the Postman API with the `Authorization Bearer` request header.

### Authentication error response

If an API key is missing, malformed, or invalid, you will receive an HTTP 401 Unauthorized response code.

Each API response returns the following set of headers to help you identify your use status:

| Header          | Description      |
| --------------- | ---------------- |
| `Authorization` | Bearer JWT-token |

### 503 response

An HTTP `503` response from our servers indicates there is an unexpected spike in API access traffic. The server is usually operational within the next few seconds. If the outage persists or you receive any other form of an HTTP `5XX` error, [contact developer support](awabah@gmail.com).

### **Need some help?**

`Need help?`
[contact developer support](awabah@gmail.com).
