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
          // Xử lý trường hợp blur ra ngoài
          inputElement.onblur = function () {
            validated(inputElement, rule);
          };

          // Xử lý trường hợp change ra ngoài
          inputElement.onchange = function () {
            validated(inputElement, rule);
          };

          // Xử lý mỗi khi người dùng nhập
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

// Viết thế này vì function bản chất nó cũng là một object

// Define Rules
// Principal of rules;
// 1. Khi có lỗi => trả ra message lỗi
// 2. Khi hợp lệ => không trả ra cái gì cả
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return (typeof value === 'String' && value.trim()) || value
        ? undefined
        : message || `Vui lòng nhập trường này`;
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
        : message || 'Vui lòng nhập email hợp lệ';
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim().length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiếu ${min}`;
    },
  };
};

Validator.isEqual = function (selector, getCompareValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getCompareValue()
        ? undefined
        : message || 'Giá trị nhập vào không chính xác';
    },
  };
};