import { async } from 'regenerator-runtime';
import PageManager from '../page-manager';
import utils from '@bigcommerce/stencil-utils';

export default class CustomProduct extends PageManager {
  constructor(context) {
    super(context);
    this.storeFontApi=context.myProductNameId
  }

  async onReady() {
    const detailsData = Number(document.getElementById('productPriceDetails').getAttribute('data-product-price').replace('$', ''));
    const changingPrice = document.getElementById('productPriceDetails');
    const idsList = [];
    const checkboxDiv = document.getElementById('customProductIds');
    document.getElementById('upsell_products').innerText = 'Add-on product';

    const ids = JSON.parse(document.getElementById('customProductIds').getAttribute("value"));

    if (ids) {
      async function makeBox(ids, storeFontApi) {
        const products = (await fetchProductsWithjquerry(ids, storeFontApi))
        let checkboxesHTML = '';

        // await Promise.all(
        //   ids.map((id) =>
        //     new Promise((resolve) => {
        //       utils.api.product.getById(
        //         id,
        //         { params: { debug: "context" } },
        //         (_, resp) => {
        //           products.push({
        //             title: resp.product.title,
        //             id: resp.product.id,
        //             price: resp.product.price.without_tax.formatted
        //           });
        //           resolve();
        //         }
        //       );
        //     })
        //   )
        // );

        products.forEach(function (product) {
          checkboxesHTML += '<input type="checkbox" id="' + product.id + '" name="' + product.title + '" value="' + product.price + '"class="form-checkbox" >' +
            '<label for="' + product.id + '" value="' + product.price + '" class="form-label form-label--alternate form-label--inlineSmall">' + product.title + ' <strong> $'  + product.price + ' </strong></label><br>';
        });

        checkboxDiv.innerHTML = checkboxesHTML;
        addCheckboxEventListeners();
      }

      makeBox(ids, this.storeFontApi);

      function addCheckboxEventListeners() {
        const checkboxes = checkboxDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function (checkbox) {
          checkbox.addEventListener('change', function (event) {
            if (event.target.checked) {
              changingPriceValue(Number(event.target.value.replace('$', '')), "add");
              idsList.unshift(event.target.id);
            } else {
              changingPriceValue(Number(event.target.value.replace('$', '')), "subtract");
              idsList.splice(idsList.indexOf(event.target.id), 1);
            }
          });
        });
      }
    }

    let amountPrice = detailsData;

    function changingPriceValue(amount, mode) {
      if (mode === "add") {
        amountPrice += amount;
      }
      if (mode === "subtract") {
        amountPrice -= amount;
      }
      if (mode === "load") {
        changingPrice.innerText = "$" + amountPrice;
      }
      changingPrice.innerText = "$" + amountPrice;
    }

    changingPriceValue(0, "load");

    document.getElementById("addToCartNormal").addEventListener("click", function () {
      var productIds = idsList; // Example array of product IDs

      // Function to add a product to the cart
      function addToCart(productId) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "/cart.php?action=add&product_id=" + productId);
          xhr.onload = function () {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(xhr.statusText);
            }
          };
          xhr.send();
        });
      }

      // Iterate over the product IDs and make the requests in sequence
      var sequence = Promise.resolve();
      productIds.forEach(function (productId) {
        sequence = sequence.then(function () {
          return addToCart(productId);
        });
      });

      // After all requests are completed, go to the cart
      sequence.then(function () {
        document.getElementById('addToCartSubmit').click();
      }).catch(function (error) {
        console.error('Error:', error);
      });
    });
    // console.log(this.storeFontApi)


    // console.log(fetchProductsWithjquerry(productIds, this.storeFontApi))
  
    async function fetchProductsWithjquerry(productIds, storeFontApi){
      let Authorization = storeFontApi
    const query = `query SrcsetImages($productIds: [Int!]!) {
      site {
        products(entityIds: $productIds) {
          edges {
            node {
              entityId
              name
              # Add more fields you want to retrieve for each product here
              prices {
 price {
   ...MoneyFields
 }
 priceRange {
   min {
     ...MoneyFields
   }
   max {
     ...MoneyFields
   }
 }
 salePrice {
   ...MoneyFields
 }
 retailPrice {
   ...MoneyFields
 }
 saved {
   ...MoneyFields
 }
 bulkPricing {
   minimumQuantity
   maximumQuantity
   ... on BulkPricingFixedPriceDiscount {
     price
   }
   ... on BulkPricingPercentageDiscount {
     percentOff
   }
   ... on BulkPricingRelativePriceDiscount {
     priceAdjustment
   }
 }
}
            }
          }
        }
      }
    }
    fragment MoneyFields on Money {
value
currencyCode
}`;
  
   try{
    const response = await fetch('/graphql', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Authorization}` // use auto-generated token
      },
      body: JSON.stringify({
        query: query,
        variables: {
          productIds: productIds
        }
      })
    });

    const data = await response.json();
    let ProductData = [];

    for (let i in data.data.site.products.edges) {
      let singleProduct = data.data.site.products.edges[i].node;
      ProductData.push({ id: singleProduct.entityId, title: singleProduct.name, price: singleProduct.prices.price.value });
    }

    return ProductData;
   }catch (error) {
    console.error(error);
    throw error; // Throw the error to be handled elsewhere if needed
  }
}
  }
}
