// export const asyncHandler =  (funct) => {
//     async (req, res, next) => {
//         try {
//             await funct(req, res, next);
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }   ---> using try-catch; see below for ways to do it using Promises 






//async handler accepts a function and returns a function too: 
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}