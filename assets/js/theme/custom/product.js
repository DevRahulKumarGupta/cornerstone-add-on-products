import { async } from 'regenerator-runtime';
import PageManager from '../page-manager';
import utils from '@bigcommerce/stencil-utils';

export default class CustomProduct extends PageManager {
  constructor(context) {
    super(context);
    this.storeFontApi = context.myProductNameId;
  }

  async onReady() {
    const checkboxDiv = document.getElementById('customProductIds');
    const detailsData = Number(document.getElementById('productPriceDetails').getAttribute('data-product-price').replace('$', ''));
    const changingPrice = document.getElementById('productPriceDetails');
    const idsList = [];
    document.getElementById('upsell_products').innerText = 'Add-on product';

    const idsAsNumbers = document.getElementById('customProductIds').getAttribute("value").split(',');
    const ids = idsAsNumbers.map(id => parseInt(id, 10));

    if (ids && checkboxDiv) {
      async function makeBox(ids, storeFontApi) {
        const products = await fetchProductsWithjquerry(ids, storeFontApi);
        const checkboxesHTML = products.map(product => `
          <input type="checkbox" id="${product.id}" name="${product.title}" value="${product.price}" class="form-checkbox">
          <label for="${product.id}" value="${product.price}" class="form-label form-label--alternate form-label--inlineSmall">
            ${product.title} <strong> $${product.price} </strong>
          </label><br>
        `).join('');

        checkboxDiv.innerHTML = checkboxesHTML;
        addCheckboxEventListeners();
      }

      makeBox(ids, this.storeFontApi);

      function addCheckboxEventListeners() {
        const checkboxes = checkboxDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', event => {
            const amount = Number(event.target.value.replace('$', ''));
            if (event.target.checked) {
              changingPriceValue(amount, "add");
              idsList.unshift(event.target.id);
            } else {
              changingPriceValue(amount, "subtract");
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
      changingPrice.innerText = `$${amountPrice}`;
    }

    changingPriceValue(0, "load");

    document.getElementById("addToCartNormal").addEventListener("click", async () => {
      const productIds = idsList; // Example array of product IDs

      // Function to add a product to the cart
      async function addToCart(productId) {
        try {
          await fetch(`/cart.php?action=add&product_id=${productId}`);
        } catch (error) {
          console.error('Error:', error);
          throw error; // Throw the error to be handled elsewhere if needed
        }
      }

      // Use Promise.all to run multiple addToCart requests concurrently
      try {
        await Promise.all(productIds.map(productId => addToCart(productId)));
        document.getElementById('addToCartSubmit').click();
      } catch (error) {
        console.error('Error:', error);
      }
    });

    async function fetchProductsWithjquerry(productIds, storeFontApi) {
      const Authorization = storeFontApi;
      const query = `
        query SrcsetImages($productIds: [Int!]!) {
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
        }
      `;

      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Authorization}` // use auto-generated token
          },
          body: JSON.stringify({
            query,
            variables: { productIds }
          })
        });

        const { data } = await response.json();
        return data.site.products.edges.map(edge => {
          const { entityId: id, name: title, prices: { price: { value: price } } } = edge.node;
          return { id, title, price };
        });
      } catch (error) {
        console.error(error);
        throw error; // Throw the error to be handled elsewhere if needed
      }
    }
  }
}
