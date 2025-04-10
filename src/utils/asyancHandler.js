const asyancHandler = (requestHandler) => {
    (req, res, next) => {
      Promise.resolve(requestHandler(req , res , next/* flag fot next request*/ )) .catch((err)=> next(err))
   }
}


export { asyancHandler }


// productiion ma hoy avu to 

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }