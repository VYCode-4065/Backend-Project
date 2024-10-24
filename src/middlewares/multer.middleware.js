import multer from "multer";

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        this.destination = "Public/temp";
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

export const upload = multer({ storage: storage })
