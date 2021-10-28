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

    private string $name;
    private string $method;
    private Action $action;

    public function __construct(string $name, string $method, Action $action)
    {
        $this->name = $name;
        $this->method = $method;
        $this->action = $action;
    }

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
