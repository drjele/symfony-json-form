<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

/** base text input html element */
class StringElement extends AbstractElement
{
    public function __construct(
        string $name,
        string $label,
        protected readonly bool $required = true
    ) {
        parent::__construct($name, $label);
    }

    protected function getType(): string
    {
        return 'string';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_string($value)) {
            throw new InvalidValueException($this->getName(), $value);
        }

        return [
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
