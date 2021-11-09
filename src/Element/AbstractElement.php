<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

abstract class AbstractElement
{
    protected string $name;

    abstract protected function getType(): string;

    abstract protected function renderElement($value): array;

    final public function getName(): string
    {
        return $this->name;
    }

    final public function render($value): array
    {
        return [
            'type' => $this->getType(),
            'name' => $this->name,
        ] + $this->renderElement($value);
    }
}
