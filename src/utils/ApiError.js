class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null 
        this.message = message
        this.success = false
        this.errors =  error

        if (stack) {
            this.stack = stack;

        }else{
            
        }

    }
}

//im not sure if this is supposed to be exported this way, i missed the part where he exported it
export  {ApiError}