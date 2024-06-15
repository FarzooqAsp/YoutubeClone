class ApiResponse {
    constructor(message="Success",data,StatusCode){
        this.message = message
        this.data = data
        this.status = StatusCode
        this.success = StatusCode < 400
    }
}