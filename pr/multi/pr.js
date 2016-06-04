/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

var details = {
  displayItems: [
    {
      label: 'Original donation amount',
      amount: {currency: 'USD', value: '65.00'}
    },
    {
      label: 'Friends and family discount',
      amount: {currency: 'USD', value: '-10.00'}
    },
    {label: 'Donation', amount: {currency: 'USD', value: '55.00'}}
  ],
  shippingOptions: [
    {
      id: 'standard',
      label: 'Standard shipping',
      amount: {currency: 'USD', value: '0.00'}
    },
    {
      id: 'express',
      label: 'Express shipping',
      amount: {currency: 'USD', value: '12.00'}
    }
  ]
};

/**
 * Updates the details based on the selected shipping option.
 * @param {object} details - The current details to update.
 * @param {string} shippingOption - The shipping option selected by user.
 * @return {object} The updated details.
 */
function updateDetails(details, shippingOption) {
  var selectedShippingOption;
  if (shippingOption === 'standard') {
    selectedShippingOption = details.shippingOptions[0];
    details.displayItems[details.displayItems.length - 1].amount.value =
        '55.00';
  } else {
    selectedShippingOption = details.shippingOptions[1];
    details.displayItems[details.displayItems.length - 1].amount.value =
        '67.00';
  }
  if (details.displayItems.length === 3) {
    details.displayItems.splice(-1, 0, selectedShippingOption);
  } else {
    details.displayItems.splice(-2, 1, selectedShippingOption);
  }
  return details;
}

/**
 * Launches payment request that provides multiple shipping options worldwide,
 * regardless of the shipping address.
 */
function onBuyClicked() {  // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    'https://android.com/pay', 'visa', 'mastercard', 'amex', 'discover',
    'maestro', 'diners', 'jcb', 'unionpay'
  ];

  var options = {requestShipping: true};

  var schemeData = {
    'https://android.com/pay': {
      'gateway': 'stripe',
      'stripe:publishableKey': 'pk_test_VKUbaXb3LHE7GdxyOBMNwXqa',
      'stripe:version': '2015-10-16 (latest)'
    }
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request =
        new PaymentRequest(supportedInstruments, details, options, schemeData);

    request.addEventListener('shippingoptionchange', e => {
      e.updateWith(new Promise(resolve => {
        resolve(updateDetails(details, request.shippingOption));
      }));
    });

    request.show()
        .then(instrumentResponse => {
          window.setTimeout(() => {
            instrumentResponse.complete(true)
                .then(() => {
                  done(
                      'Thank you!', request.shippingAddress,
                      request.shippingOption, instrumentResponse.methodName,
                      instrumentResponse.details);
                })
                .catch(err => {
                  error(err.message);
                });
          }, 2000);
        })
        .catch(err => {
          error(err.message);
        });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}