<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class BoolElement extends AbstractElement
{
    private bool $required;

    public function __construct(
        string $name,
        bool $required = true
    ) {
        $this->name = $name;
        $this->required = $required;
    }

    protected function getType(): string
    {
        return 'bool';
    }

    protected function renderElement($value): array
    {
        if (null !== $value && !\is_bool($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
