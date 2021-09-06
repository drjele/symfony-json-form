<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\SymfonyJsonForm\Form;

use Drjele\SymfonyJsonForm\Traits\ElementCollectionTrait;

final class FormBuilder
{
    use ElementCollectionTrait;

    private string $name;
    private string $route;

    public function __construct(string $name, string $route)
    {
        $this->name = $name;
        $this->route = $route;
    }

    public function render($data): array
    {
        $elements = [];

        foreach ($this->elements as $element) {
            $elements[] = $element->render($data[$element->getName()] ?? null);
        }

        return [
            'name' => $this->name,
            'route' => $this->route,
            'elements' => $elements,
        ];
    }
}
