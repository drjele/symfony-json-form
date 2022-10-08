<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidModeException;
use Symfony\Contracts\Translation\TranslatorInterface;

class AutocompleteElement extends AbstractElement
{
    public const MODE_SINGLE = 'single';
    public const MODE_MULTIPLE = 'multiple';

    public const MODES = [
        self::MODE_SINGLE,
        self::MODE_MULTIPLE,
    ];

    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly string $route,
        protected readonly string $mode = self::MODE_SINGLE,
        protected readonly bool $required = true,
        protected readonly string $parameter = 'query'
    ) {
        if (false === \in_array($this->mode, static::MODES, true)) {
            throw new InvalidModeException($name, $this->mode, static::MODES);
        }
    }

    protected function getType(): string
    {
        return 'autocomplete';
    }

    protected function renderElement(mixed $value, ?TranslatorInterface $translator): array
    {
        if (null !== $value) {
            $value = (array)$value;
        }

        return [
            'route' => $this->route,
            'parameter' => $this->parameter,
            'mode' => $this->mode,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
