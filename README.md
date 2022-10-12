# Symfony json form

**You may fork and modify it as you wish**.

Any suggestions are welcomed.

## Usage

Add this to your **services.yaml**.

```yaml
services:
    _instanceof:
        Drjele\Symfony\JsonForm\Service\AbstractFormService:
            calls:
                - [ setSerializer, [ '@serializer' ] ]
```

```php
<?php

declare(strict_types=1);

/*
 * Copyright (c) Vivre
 */

namespace Acme\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Acme\Dto\ProductEditDto;
use Acme\Form\ProductEditForm;
use Acme\Service\ProductEditService;

class ProductController extends AbstractController
{
    public function edit(Request $request, ProductEditForm $productEditForm, ProductEditService $productEditService): Response
    {
        $id = $request->get('id');

        if (Request::METHOD_POST === $request->getMethod()) {
            /** @var ProductEditDto $dto */
            $dto = $productEditForm->handle($request);

            $productEditService->save($dto);
        } else {
            $productEditService->createDto($id);
        }

        return $this->json(
            [
                'form' => $productEditForm->render($dto),
            ]
        );
    }
}
```

```php
<?php

declare(strict_types=1);

/*
 * Copyright (c) Vivre
 */

namespace Acme\Dto;

use Drjele\Symfony\JsonForm\Contract\DtoInterface;

class ProductEditDto implements DtoInterface
{
    private int $id;
    private string $status;

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }
}
```

```php
<?php

declare(strict_types=1);

/*
 * Copyright (c) Vivre
 */

namespace Acme\Form;

use Drjele\Symfony\JsonForm\Element\ArrayElement;
use Drjele\Symfony\JsonForm\Element\NumberElement;
use Drjele\Symfony\JsonForm\Form\Action;
use Drjele\Symfony\JsonForm\Form\Form;
use Drjele\Symfony\JsonForm\Service\AbstractFormService;
use Acme\Dto\ProductEditDto;

class ProductEditForm extends AbstractFormService
{
    protected function getDtoClass(): string
    {
        return ProductEditDto::class;
    }

    protected function getAction(): Action
    {
        return new Action('product-edit');
    }

    protected function build(Form $form): void
    {
        $form->addElement(new NumberElement('id'))
            ->addElement(new ArrayElement('status', ['active', 'inactive']));
    }
}
```

```php
<?php

declare(strict_types=1);

/*
 * Copyright (c) Vivre
 */

namespace Acme\Service;

use Acme\Dto\ProductEditDto;

class ProductEditService
{
    public function createDto(int $id): ProductEditDto
    {
        $dto = new ProductEditDto();

        $dto->setId($id);

        /* @todo populate all the data from the db */

        return $dto;
    }

    public function save(ProductEditDto $dto): void
    {
    }
}
```

### React

Use the components from **./assets/react** folder to interpret the backend response.
The **Config** component is project specific. For me, it holds the locale context of the application.
It is integrated with:

* `willdurand/js-translation-bundle` for the Translator.
* `friendsofsymfony/jsrouting-bundle` for the UrlGenerator.

## Dev

```shell
git clone git@gitlab.com:drjele-symfony/json-form.git
cd json-form/scripts/docker/
cp ~/.ssh/id_* ./

echo 'git config --global user.name "<your name>"' >> ./.profile_personal && \
echo 'git config --global user.email "<your email>"' >> ./.profile_personal

docker compose build && docker compose up -d
docker compose exec php sh
composer install
```

## Todo

* Render and handle complex types like \DateTime.
* Unit tests.
