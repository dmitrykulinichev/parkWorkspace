# Водії
> `page:uklon-drivers` · `/uklon-drivers`

Інтеграція з Uklon: переглядайте та керуйте водіями, що працюють у системі Uklon, синхронізуйте статуси та баланси.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:uklon-drivers-list` | Список водіїв Uklon: керуйте прив'язками та переглядайте баланси водіїв у систем |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:driver-integration` | [modal_driver_integration.md](../modals/modal_driver_integration.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_uklon_drivers_main` | `[data-i-doc="page:uklon-drivers"]` | `/uklon-drivers` |

## Функціональний опис

```js
/**
 * @doc-page  page_uklon_drivers_index
 * @doc-title Водії Uklon
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_driver_integration (Інтеграція/зв'язування водіїв)
 * @doc-features
 *   - Відображення списку водіїв Uklon (таблиця або список)
 *   - Пошук водіїв за ключовими полями (наприклад, ім'я, прізвище)
 *   - Синхронізація даних про водіїв з Uklon
 *   - Сортування списку за полем
 *   - Пагінація з вибором кількості записів на сторінці
 *   - Відкриття модального вікна для зв'язування водіїв
 *   - Відображення станів завантаження та порожнього списку
 * @doc-api
 *   - GET /uklon-drivers
 *   - GET /uklon-drivers/sync
 * @doc-entities
 *   - Driver (Uklon)
 */
```
