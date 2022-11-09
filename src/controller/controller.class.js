'use stricts'

const Store = require("../model/store.class")
const View = require("../view/view.class")

class Controller {

    constructor () {

        this.store = new Store(1, 'Almacen ACME');
        this.view = new View();
        
    } 

    async init() {

        await this.store.loadData();
        this.store.products.forEach(product => this.view.renderProduct(product));
        this.store.categories.forEach(category => this.view.setCategoryList(category));
        this.view.setTotalImport(this.store.totalImport());


        this.store.products.forEach(product =>  {
            this.addListeners(product.id);
        });
        this.addListenetToNav();
        this.view.mostrarVista("almacen");
        this.addListenerToFormSubmitButton();
    
    }

    addListenetToNav () {

        let productNav = document.getElementById("almacen-nav");
        productNav.addEventListener('click', ()=> {this.view.mostrarVista("almacen")});
        
        let categoriasNav = document.getElementById("categorias-table-nav");
        categoriasNav.addEventListener('click', ()=> {this.view.mostrarVista("categorias-table")});
        
        let anyadirProductoNav = document.getElementById("new-prod-nav");
        anyadirProductoNav.addEventListener('click', ()=> {
            this.view.cleanProductTable();
            this.view.mostrarVista("new-prod");
        });
        
        let anyadirCategoriaNav = document.getElementById("newcat-nav");
        anyadirCategoriaNav.addEventListener('click', ()=> {this.view.mostrarVista("newcat")});
        
        let aboutNav = document.getElementById("about-nav");
        aboutNav.addEventListener('click', ()=> {this.view.mostrarVista("about")});

    }

    async addProductToStore (payload) {


        let form = document.getElementById('new-prod');

        if(form.checkValidity()) {
            try {
                let newProd;
               
                newProd = await this.store.addProduct(payload);
                
                this.view.renderProduct(newProd);
                
                this.addListeners(newProd.id);
    
                this.view.mostrarVista("almacen");
               
                this.view.setTotalImport(this.store.totalImport());
            } catch (err) {
                this.view.renderMessage(err);
    
            }
        }      
    }

    async editProductFromStore (payload) {

        let product = await this.store.editProduct(payload);
        this.view.editProductInStore(product);
        this.view.mostrarVista("almacen");
        this.view.setTotalImport(this.store.totalImport());
        this.view.cleanProductTable();

    }

    async upUnitsProductFromStore (id) {

        let product = this.store.getProductById(id);
        product.units++;
        product = await this.store.editProduct(product);
        this.view.editProductInStore(product);
        this.view.setTotalImport(this.store.totalImport());
    }

    async downUnitsProductFromStore (id) {

        let product = this.store.getProductById(id);
        if(product.units > 0) {
            product.units--;
        }
        product = await this.store.editProduct(product);
        this.view.editProductInStore(product);
        this.view.setTotalImport(this.store.totalImport());
    }

    async addCategoryToStore(payload) {

        try {
            const newCat = await this.store.addCategory(payload.name, payload.description);
            this.view.setCategoryList(newCat);
            this.view.mostrarVista("categorias-table");
        } catch (err) {
            this.view.renderMessage(err);
        }

    }

    async deleteProductFromStore(productId) {

        try {
            const prodDel = await this.store.delProduct(productId);
            this.view.removeProductFromTable(prodDel);
        } catch (err) {
            this.view.renderMessage(err);
        }

    }

    async deleteCategoryFromStore(categoryId) {

        try {
            const catDel = await this.store.delCategory(categoryId);
            this.view.removeCategoryFromTable(catDel);
        } catch (err) {
            this.view.renderMessage(err);
        }

    }

    editProductByForm(id) {

        this.view.mostrarVista("new-prod");
        const product = this.store.getProductById(id);
        this.view.fillProductTable(product);

    }

    addListeners (id) {

        this.addListenerToDeleteButom(id);
        this.addListenerToEditButom (id); 
        this.addListenerToUpButom (id);
        this.addListenerToDownButom (id); 

    }

    addListenerToDeleteButom (id) {

        const delButton = document.getElementById(id + "-id-prod-del"); 
        delButton.addEventListener('click', ()=> {
            this.deleteProductFromStore(id);
        });

    }

    addListenerToEditButom (id) {

        const editButton = document.getElementById(id + "-id-prod-edit"); 
        editButton.addEventListener('click', ()=> {
            this.editProductByForm(id);
        });
    }

    addListenerToUpButom (id) {

        const upButton = document.getElementById(id + "-id-prod-up"); 
        upButton.addEventListener('click', ()=> {
            this.upUnitsProductFromStore(id);
        });

    }

    addListenerToDownButom (id) {

        const downButton = document.getElementById(id + "-id-prod-down"); 
        downButton.addEventListener('click', ()=> {
            this.downUnitsProductFromStore(id);
        });
        
    }

    addListenerToFormSubmitButton () {
        

            // función manejadora del formulario 'new-prod'
            document.getElementById('new-prod').addEventListener('submit', (event) => {
              event.preventDefault()

          
              // Aquí el código para obtener los datos del formulario
              const id = document.getElementById('newprod-id').value
              const name = document.getElementById('newprod-name').value
              const price = document.getElementById('newprod-price').value 
              const category = document.getElementById('newprod-cat').value 
              const units = document.getElementById('newprod-units').value 
              // ...
              
              // Aquí llamamos a la función del controlador que añade productos (addProductToStore)
              // pasándole como parámetro esos datos
              if(id) {
                this.editProductFromStore({ id, name, price, category, units })
          
              } else {
                this.validateForm();
                this.addProductToStore({ name, price, category, units })   
          
              }
              // Sintaxis de ES2015 quoe equivale a 
              //
              // myController.addProductToStore(
              //   { 
              //     name: name,
              //     price: price 
              //   }
              // ) 
            })
          
            document.getElementById('newcat').addEventListener('submit', (event) => {
              event.preventDefault()
          
              // Aquí el código para obtener los datos del formulario
              const name = document.getElementById('newcat-name').value
              const description = document.getElementById('newcat-description').value 
              // ...
              
              // Aquí llamamos a la función del controlador que añade productos (addProductToStore)
              // pasándole como parámetro esos datos
              this.addCategoryToStore({name, description})   
              // Sintaxis de ES2015 que equivale a 
              //
              // myController.addProductToStore(
              //   { 
              //     name: name,
              //     price: price 
              //   }
              // ) 
            })
          
            /*
            document.getElementById('del-prod').addEventListener('submit', (event) => {
              event.preventDefault()
          
              myController.deleteProductFromStore(document.getElementById('delprod-id').value)      
            })
            */
          
            document.getElementById('del-cat').addEventListener('submit', (event) => {
              event.preventDefault()
          
              this.deleteCategoryFromStore(document.getElementById('delcat-id').value)      
            })

            document.getElementById('newprod-name').addEventListener('blur',this.validationName.bind(this));

            document.getElementById('newprod-cat').addEventListener('blur', this.validationCategory.bind(this));

            document.getElementById('newprod-units').addEventListener('blur', this.validationUnits.bind(this));

            document.getElementById('newprod-price').addEventListener('blur',this.validationPrice.bind(this));

          
         
    }

    validateForm() {
        this.validationName();
        this.validationCategory();
        this.validationUnits();
        this.validationPrice();
    }

    validationName() {
        let node = document.getElementById('newprod-name');

        if(this.store.productNameExist(node.value)) {
            node.setCustomValidity("El producto ya existe");
        } else {
            node.setCustomValidity("");
        }
        node.nextElementSibling.innerHTML = node.validationMessage;
    }

    validationCategory() {
        let node = document.getElementById('newprod-cat');
        node.nextElementSibling.innerHTML = node.validationMessage;
    }

    validationUnits() {
        let node = document.getElementById('newprod-units');
        node.nextElementSibling.innerHTML = node.validationMessage;
    }

    validationPrice()  {
        let node = document.getElementById('newprod-price');
        node.nextElementSibling.innerHTML = node.validationMessage;
    }



}

module.exports = Controller;