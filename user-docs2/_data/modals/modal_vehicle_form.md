# vehicle-form
> `modal:vehicle-form` · відкривається з: `page:vehicles`

Вкажіть основні дані автомобіля: держномер, VIN-код, марку та модель. Також можна додати колір та початковий пробіг.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_form` | `[data-i-doc="modal:vehicle-form"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * Модальне вікно для додавання/редагування автомобіля
 * 
 * @doc-modal modal_vehicle_form
 * @doc-title Додати/Редагувати автомобіль
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - створення та редагування картки автомобіля
 *   - управління фотографією транспортного засобу
 *   - гнучкий вибір марки та моделі (Autocomplete + freeSolo)
 *   - призначення тегів для візуальної класифікації
 *   - налаштування пріоритетності авто в парку
 *   - детальний опис технічних характеристик та комплектації (паливо, колір, опції)
 *   - валідація полів на основі динамічного переліку обов'язкових полів
 * @doc-api
 *   - POST /api/v1/files/upload (через useFileUpload)
 *   - DELETE /api/v1/files/${id} (через useFileUpload)
 * @doc-entities
 *   - Vehicle, Tag
 */
```
