# 🎬 Custom YouTube Backend API

A robust **Tweet-like social media backend** built with **Node.js**, **Express**, and **MongoDB**, designed for managing user-generated content like tweets, videos, comments, likes, subscriptions, playlists, and more!

## 🚀 Features

- 🔐 **JWT Authentication & Authorization**: Secure user access with JSON Web Tokens (JWT).
- 🐦 **Tweet Creation & Interaction**: Post, delete, and update tweets with threaded replies.
- ❤️ **Like System**: Like tweets, comments, and videos to boost engagement.
- 📺 **Video Upload & Streaming**: Upload and stream videos seamlessly with **Cloudinary**.
- 💬 **Nested Comment System**: Add and manage comments on videos, with support for replies and nested threads.
- 📁 **Playlist Creation & Management**: Group videos into playlists for better organization.
- 📌 **Subscription Management**: Subscribe/unsubscribe to channels with ease.
- 📊 **User Dashboard**: View statistics and manage user activity.
- 🖼️ **Multer for Secure File Uploads**: Handle file uploads securely with **Multer**.

---

## 🛠️ Tech Stack

| Tech         | Description                                         |
|--------------|-----------------------------------------------------|
| **Node.js**  | Backend runtime                                     |
| **Express.js**| Web framework                                       |
| **MongoDB**  | NoSQL database                                      |
| **Mongoose** | MongoDB object modeling                              |
| **JWT**      | Authentication system                               |
| **Multer**   | Secure file uploads                                  |
| **Cloudinary**| Media hosting for video and thumbnail management    |

---

## ⚙️ Setup Instructions

### 1. Create a `.env` file in the root directory with the following:

```env
PORT=YOUR_PORT
MONGODB_URL=YOUR_URL
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=YOUR_REFRESH_TOKEN
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_CLOUD_TOKEN=your_cloud_token
```
### 2.Install node Dependencies:


``` 
npm install 
```

### 3.Start the Server

```
npm run dev
```







