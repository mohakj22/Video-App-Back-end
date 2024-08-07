import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/Public/temp");
        // Destination is the directory or place on server, where we are going to save the file uploaded by the user or coming from the frontend.
        // we get a access of a function which gives us the access to further three parameters re, file, callBack function cb
        // Now this cb takes to parameters error and path to destination
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.filename}`);
    }
})
export const upload = multer({ storage, });
