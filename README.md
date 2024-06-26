# Symfony json form

**You may fork and modify it as you wish**.

Any suggestions are welcomed.

## Purpose

The purpose of this library is to create forms for single page applications, with a symfony backend.
The forms are constructed in the backend and serialized to json, that can be rendered in the frontend. In the assets folder you can find a react component to render the form.
There are 2 versions of the form:

* [formV1](./assets/react/formV1), is the original react components for rendering the form, kept for backwards compatibility.
* [formV2](./assets/react/formV2), the new components and the recommended way to render the json.

## Usage

Add this to your **services.yaml**.

```yaml
services:
    _instanceof:
        Drjele\Symfony\JsonForm\Service\Contract\AbstractFormService:
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
            $dto = $productEditForm->handleRequest($request);

            $productEditService->save($dto);
        } else {
            $dto = $productEditService->createDto($id);
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

use Acme\Dto\ProductEditDto;
use Drjele\Symfony\JsonForm\Element\ArrayElement;
use Drjele\Symfony\JsonForm\Element\NumberElement;
use Drjele\Symfony\JsonForm\Form\Action;
use Drjele\Symfony\JsonForm\Form\Form;
use Drjele\Symfony\JsonForm\Service\Contract\AbstractFormService;

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
        $form->addElement(new NumberElement('id', 'Id'))
            ->addElement(new ArrayElement('status', 'Status', ['active' => 'Active', 'inactive' => 'Inactive']));
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
cd json-form

rm -rf .git/hooks && ln -s ../dev/git-hooks .git/hooks

./dc build && ./dc up -d
```

## Todo

* Render and handle complex types like \DateTime.
* Unit tests.
