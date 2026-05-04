# bonus-penalty-form
> `modal:bonus-penalty-form` · відкривається з: `page:bonuses-penalties`

Керуйте фінансами водія: додавайте премії або штрафи, прив'язуйте їх до поїздок або специфічних інцидентів.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_bonus_penalty_form` | `[data-i-doc="modal:bonus-penalty-form"]` | `/bonuses-penalties` |

## Функціональний опис

```js
/**
 * @doc-modal modal_bonus_penalty_form
 * @doc-title Форма премії/штрафу
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - Створення або редагування запису премії або штрафу
 *   - Вибір типу (Премія/Штраф)
 *   - Прив'язка до водія
 *   - Опціональна прив'язка до автомобіля
 *   - Введення суми та дати
 *   - Опис причини премії/штрафу
 *   - Валідація даних
 * @doc-api
 *   - POST /api/bonuses-penalties
 *   - PUT /api/bonuses-penalties/{id}
 *   - GET /api/bonuses-penalties/options
 * @doc-entities
 *   - BonusPenalty, Driver, Vehicle
 */
```
