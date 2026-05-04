# Автомобілі
> `page:uklon-vehicles` · `/uklon-vehicles`

Інтеграція з Uklon: переглядайте та керуйте автомобілями, що працюють у системі Uklon, синхронізуйте статуси та бонуси.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:uklon-vehicles-list` | Список авто Uklon: керуйте прив'язками та переглядайте статуси автомобілів у сис |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:vehicle-integration` | [modal_vehicle_integration.md](../modals/modal_vehicle_integration.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_uklon_vehicles_main` | `[data-i-doc="page:uklon-vehicles"]` | `/uklon-vehicles` |

## Функціональний опис

```js
/**
 * @doc-page  page_uklon_vehicles_index
 * @doc-title Автомобілі Uklon
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_vehicle_integration (Інтеграція/зв'язування автомобіля)
 * @doc-features
 *   - Відображення списку автомобілів Uklon (таблиця або список)
 *   - Пошук автомобілів за ключовими полями (наприклад, номерний знак)
 *   - Синхронізація даних про автомобілі з Uklon
 *   - Сортування списку за полем
 *   - Пагінація з вибором кількості записів на сторінці
 *   - Відкриття модального вікна для зв'язування автомобілів
 *   - Відображення станів завантаження та порожнього списку
 * @doc-api
 *   - GET /uklon-vehicles
 *   - GET /uklon-vehicles/sync
 * @doc-entities
 *   - Vehicle (Uklon)
 */
```
