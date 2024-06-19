class ApiResponse {
    constructor(StatusCode,data,message="Success"){
        this.status = StatusCode
        this.data = data
        this.message = message
        this.success = StatusCode < 400
    }
}
export { ApiResponse }