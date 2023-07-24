export default function generateProductCards(products) {
    let carouselHTML = '';
  
    products.forEach(function (product) {
      carouselHTML += '<div class="product-card">';
      carouselHTML += '<img src="' + product.image + '" alt="' + product.title + '" class="product-image">';
      carouselHTML += '<label class="product-price">$' + product.price + '</label> <br>';
      carouselHTML += '<label class="product-title">' + product.title + '</label><br>';
      carouselHTML += '<label class="custom-checkbox">';
      carouselHTML += '<input type="checkbox" id="' + product.id + '" name="' + product.title + '" value="' + product.price + '" class="checkmark">';
      carouselHTML += '</label>';
      carouselHTML += '</div>';
    });
  
    return carouselHTML;
  }
  