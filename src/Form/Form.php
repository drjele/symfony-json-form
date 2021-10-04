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
    private Action $action;

    public function __construct(string $name, Action $action)
    {
        $this->name = $name;
        $this->action = $action;
    }

    public function render($data): array
    {
        return [
            'name' => $this->name,
            'action' => $this->action->render(),
            'elements' => $this->renderElements($data),
        ];
    }
}
