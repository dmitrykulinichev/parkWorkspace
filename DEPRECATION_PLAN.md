# План видалення модуля "Страховки" (InsurancePolicy)

Цей документ описує кроки для повного видалення застарілого модуля "Страховки" після успішної міграції на універсальний модуль "Документи" (`Document`).

**Статус:** Заплановано (після тестування нового модуля).

---

## 1. Фронтенд (React)

### Видалити файли:
- `resources/js/pages/InsurancePolicies/` (вся папка)
- `resources/js/components/modals/InsurancePolicyFormModal.jsx`
- `resources/js/queries/insurancePolicies.js`
- `resources/js/hooks/useInsurancePoliciesPage.js`

### Оновити код:
- **`resources/js/app.jsx`**:
  - Видалити імпорт `InsurancePolicies`.
  - Видалити `<Route path="insurance-policies" ... />`.

- **`resources/js/components/Navigation/NavigationItems.js`**:
  - Видалити закоментований пункт меню "Страхування".

---

## 2. Бекенд (Laravel)

### Видалити файли:
- `app/Http/Controllers/Api/InsurancePolicyController.php`
- `app/Services/InsuranceService.php`
- `app/Http/Resources/InsurancePolicyResource.php`
- `app/Models/InsurancePolicy.php`
- `app/Enums/InsurancePolicyStatusEnum.php`
- `app/Enums/InsurancePolicyTypeEnum.php`

### Оновити код:
- **`routes/api.php`**:
  - Видалити групу роутів `insurance-policies` та `Route::apiResource('insurance-policies', ...);`.
  - Видалити `use App\Http\Controllers\Api\InsurancePolicyController;`.

- **`app/Models/Vehicle.php`**:
  - Видалити метод `insurancePolicies()`.
  - Видалити метод `activeInsurancePolicies()`.

- **`app/Http/Controllers/Api/FileController.php`**:
  - У методі `getEntity`, видалити рядок:
    `'insurance_policy' => InsurancePolicy::class,`
  - Видалити `use App\Models\InsurancePolicy;`.

- **`config/files.php`**:
  - Видалити `'insurance_policy' => 'files/insurance',` з масиву `storage_paths`.

---

## 3. База Даних

### Створити міграцію для видалення таблиці:
Створити нову міграцію `php artisan make:migration drop_insurance_policies_table`.

```php
public function up(): void
{
    Schema::dropIfExists('insurance_policies');
}

public function down(): void
{
    // Відновлення таблиці (опціонально, якщо потрібен rollback)
    // Можна скопіювати структуру з оригінальної міграції
}
```

---

## 4. Перевірка

Після виконання всіх кроків:
1. Запустити `php artisan optimize:clear`.
2. Перевірити роботу сторінки "Документи".
3. Перевірити роботу віджета "Проблеми з документами" на дашборді.
4. Перевірити завантаження/відображення файлів у документах.
