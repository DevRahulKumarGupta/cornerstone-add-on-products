import { async } from 'regenerator-runtime';
let detailsData = Number(document.getElementById('productPriceDetails').getAttribute('data-product-price').replace('$', ''))
let changingPrice=document.getElementById('productPriceDetails')
import utils from '@bigcommerce/stencil-utils';
const ids = JSON.parse(document.getElementById('customProductIds').getAttribute("value"))
const idsList = []
var checkboxDiv = document.getElementById('customProductIds');
// const form = document.getElementById('addToCartForm');
// const submitButton = document.getElementById('submitButton');

if(ids){

async function makeBox(ids) {
    var products = [];
  let checkboxesHTML = ''
    await Promise.all(
      ids.map((id) =>
        new Promise((resolve) => {
          utils.api.product.getById(
            id,
            { params: { debug: "context" } },
            (_, resp) => {
              products.push({
                title: resp.product.title,
                id: resp.product.id,
                price: resp.product.price.without_tax.formatted
              });
              resolve();
            }
          );
        })
      )
    );
    products.forEach(function(product) {
        checkboxesHTML += '<input type="checkbox" id="' + product.id + '" name="' + product.title + '" value="'+product.price+'"class="form-checkbox" >' +
          '<label for="' + product.id + '" value="'+product.price+'" class="form-label form-label--alternate form-label--inlineSmall">' + product.title + ' <strong>' + product.price + ' </strong></label><br>';
        });
    checkboxDiv.innerHTML = checkboxesHTML;
   addCheckboxEventListeners()
  
  }
  
  
  
  makeBox(ids);
  
  function addCheckboxEventListeners() {
      var checkboxes = checkboxDiv.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function(event) {
            if (event.target.checked) {
                // console.log(Number(event.target.value.replace('$','')))
                changingPriceValue(Number(event.target.value.replace('$','')), "add")
            console.log('Checkbox with id ' + event.target.id + ' is checked.');
            idsList.unshift(event.target.id)
            console.log(idsList)
          } else {
            // console.log(Number(event.target.value.replace('$','')))
            changingPriceValue(Number(event.target.value.replace('$','')), "subtract")
            console.log('Checkbox with id ' + event.target.id + ' is unchecked.');
            idsList.splice(idsList.indexOf(event.target.id), 1);
            console.log(idsList)
          }
        });
      });
    }    
}


let amountPrice = detailsData
function changingPriceValue(amount, mode){
    // console.log(amount, mode)
    if(mode=="add"){
        // console.log(defaultPrice)
        amountPrice+= amount
       
    }
    if(mode=="subtract"){
        amountPrice-=amount
    }
    if(mode=="load"){
        changingPrice.innerText="$"+amountPrice
        document.getElementById('upsell_products').innerText='Add-on product'

    }
        
    changingPrice.innerText="$"+amountPrice

}

changingPriceValue(0, "load")

document.getElementById("addToCartNormal").addEventListener("click", function() {

    var productIds = idsList; // Example array of product IDs
    // console.log(productIds)
    // Function to add a product to the cart
    function addToCart(productId) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/cart.php?action=add&product_id=" + productId);
        xhr.onload = function() {
          if (xhr.status === 200) {
            console.log('Product ' + productId + ' added with status ' + xhr.status);
            resolve();
          } else {
            console.log('Failed to add product ' + productId + ' with status ' + xhr.status);
            reject(xhr.statusText);
          }
        };
        xhr.send();
      });
    }
  
    // Iterate over the product IDs and make the requests in sequence
    var sequence = Promise.resolve();
    productIds.forEach(function(productId) {
      sequence = sequence.then(function() {
        return addToCart(productId);
      });
    });
  
    // After all requests are completed, go to the cart
    sequence.then(function() {
      console.log("done")
      // submitButton.click()
      
      document.getElementById('addToCartSubmit').click()
        // console.log(ProductDetails)
        // console.log(form)
    //   window.location = "/cart.php";
    }).catch(function(error) {
      console.error('Error:', error);
    });
  });
 




