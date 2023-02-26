const errorHandlerMiddleware = (err, req, res, next) => {
    console.log(err)
    return res.status(500).json({ msg:'something went wrong, try again later' })
}

module.exports = errorHandlerMiddleware