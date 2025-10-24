const productService = require('../services/product.service');
const { validationResult } = require('express-validator');

class ProductController {
  
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      return res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async createProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const data = req.body;

      const result = await productService.createProduct(data);

      if (result.success) {
        const newProduct = await productService.getProductById(result.id_producto);
        return res.status(201).json({
          success: true,
          message: result.message,
          data: newProduct
        });
      } else {
        return res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const data = req.body;

      const updatedProduct = await productService.updateProduct(parseInt(id), data);

      return res.json({
        success: true,
        message: 'Producto actualizado correctamente',
        data: updatedProduct
      });
      
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      await productService.deleteProduct(parseInt(id));

      return res.json({
        success: true,
        message: 'Producto eliminado correctamente'
      });
      
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new ProductController();