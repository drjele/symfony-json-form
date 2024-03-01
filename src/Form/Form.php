<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Form;

use Drjele\Symfony\JsonForm\Traits\ElementCollectionTrait;

final class Form
{
    use ElementCollectionTrait;

    public function __construct(
        private readonly string $name,
        private readonly string $method,
        private readonly Action $action
    ) {}

    public function render($data): array
    {
        return [
            'name' => $this->name,
            'method' => $this->method,
            'action' => $this->action->render(),
            'elements' => $this->renderElements($data),
        ];
    }
}
