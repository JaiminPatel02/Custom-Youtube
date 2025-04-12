class ApiError extends Error { 
    constructor(
        statesCode,
        message = " Somthing went wrong",
        errors = [],
        stack = ""
        
    ) {
        super(message)
        this.statesCode = statesCode
        this.message = message
        this.data = null 
        this.success = false;
        this.errors = errors

        // production  kai file ma error ave che e ke 

        if (stack) { 
            this.stack = stack
        } 
        else { Error.captureStackTrace(this, this.constructor) }
    }
}
export {ApiError}