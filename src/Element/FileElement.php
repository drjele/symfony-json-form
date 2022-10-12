<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class FileElement extends AbstractElement
{
    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly bool $required = true
    ) {
    }

    protected function getType(): string
    {
        return 'file';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'required' => $this->required,
        ];
    }
}
