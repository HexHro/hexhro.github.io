function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }

      element = element.parentElement;
    }
  }

  let selectorRules = [];

  function validated(inputElement, rule) {
    const errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    let errorMessage;

    let rules = selectorRules[rule.selector];

    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case 'checkbox':
        case 'radio':
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ':checked')
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }

      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add('invalid');
    } else {
      errorElement.innerText = '';
      inputElement.parentElement.classList.remove('invalid');
    }

    return !errorMessage;
  }

  const formElement = document.querySelector(options.form);

  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true;

      options.rules.forEach(function (rule) {
        const inputElement = formElement.querySelector(rule.selector);
        let isValid = validated(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === 'function') {
          const enableInputs = formElement.querySelectorAll('[name]');
          const formValues = Array.from(enableInputs).reduce(
            (values, input) => {
              switch (input.type) {
                case 'radio':
                  values[input.name] = formElement.querySelector(
                    'input[name="' + input.name + '"]:checked'
                  ).value;
                  break;
                case 'checkbox':
                  if (!input.matches(':checked')) {
                    values[input.name] = '';
                    return values;
                  }

                  if (!Array.isArray(values[input.name])) {
                    values[input.name] = [];
                  }

                  values[input.name].push(input.value);
                  break;
                case 'file':
                  values[input.name] = input.files;
                  break;
                default:
                  values[input.name] = input.value;
              }

              return values;
            },
            {}
          );
          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach(function (rule) {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach((inputElement) => {
        if (inputElement) {
          // X??? l?? tr?????ng h???p blur ra ngo??i
          inputElement.onblur = function () {
            validated(inputElement, rule);
          };

          // X??? l?? tr?????ng h???p change ra ngo??i
          inputElement.onchange = function () {
            validated(inputElement, rule);
          };

          // X??? l?? m???i khi ng?????i d??ng nh???p
          inputElement.oninput = function () {
            const errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSelector);
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove(
              'invalid'
            );
          };
        }
      });
    });
  }
}

// Vi???t th??? n??y v?? function b???n ch???t n?? c??ng l?? m???t object

// Define Rules
// Principal of rules;
// 1. Khi c?? l???i => tr??? ra message l???i
// 2. Khi h???p l??? => kh??ng tr??? ra c??i g?? c???
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return (typeof value === 'String' && value.trim()) || value
        ? undefined
        : message || `Vui l??ng nh???p tr?????ng n??y`;
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value.trim())
        ? undefined
        : message || 'Vui l??ng nh???p email h???p l???';
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim().length >= min
        ? undefined
        : message || `Vui l??ng nh???p t???i thi???u ${min}`;
    },
  };
};

Validator.isEqual = function (selector, getCompareValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getCompareValue()
        ? undefined
        : message || 'Gi?? tr??? nh???p v??o kh??ng ch??nh x??c';
    },
  };
};
