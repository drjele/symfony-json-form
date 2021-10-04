<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

final class HiddenElement extends AbstractElement
{
    public function __construct(string $name)
    {
        $this->name = $name;
    }

    protected function getType(): string
    {
        return 'hidden';
    }

    protected function renderValue($value): array
    {
        if (null !== $value && (\is_scalar($value) && !\is_array($value)) === false) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'value' => $value,
        ];
    }
}
