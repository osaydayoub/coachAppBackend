import STATUS_CODE from "../constants/statusCode.js";
import Product  from "../models/productModel.js"
import User from "../models/userModel.js";


// @des      creats a new meal
// @route    POST /api/v1/coach/products
// @access   Private
export const createProduct = async (req, res, next) => {
  
  const {barcodeNumber,caloriesIn100g}=req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    if (!barcodeNumber || isNaN(caloriesIn100g)) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please add all fields");
    }
    const product = await Product.create({
      barcodeNumber,
      caloriesIn100g,
    });

    res.status(STATUS_CODE.CREATED).send(product);
  } catch (error) {
    next(error);
  }
};

// @des      Get a prouduct with barcode number
// @route    GET /api/v1/coach/products/:number
// @access   Private
export const getProductByBarcodeNumber = async (req, res, next) => {
     const barcodeNumber = req.params.number;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(STATUS_CODE.UNAUTHORIZED);
      throw new Error("Not authorized");
    }
    if (!barcodeNumber) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("barcode number query parameter is required");
    }

    const product = await Product.findOne({ barcodeNumber });

    // Check if product exists
    if (!product) {
      return res.status(STATUS_CODE.NOT_FOUND).json({ message: "Product not found" });
    }
    res.status(STATUS_CODE.OK).send(product);
  } catch (error) {
    next(error);
  }
};
