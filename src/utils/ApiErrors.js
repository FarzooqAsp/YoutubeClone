class apiError extends Error{
    constructor(StatusCode,message="something went wrong",errors=[],stack=""){
               super(message)
               this.StatusCode = StatusCode
               this.errors = errors
               this.data = null
               this.message = message
               this.success = false

               if(stack){
                this.stack = stack
               }
               else{
                Error.captureStackTrace(this, this.constructor)
               }
    }
}
export {apiError}