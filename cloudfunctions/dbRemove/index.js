// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
const db = cloud.database()
exports.main = async(event, context) => {
  console.log(event);
  console.log(context);
  try {
    return await db.collection(event.name).where(event.params).remove()
  } catch (e) {
    console.error(e)
  }
}